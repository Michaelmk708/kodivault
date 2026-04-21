import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BedDouble, Bath, MapPin, Search, Plus, Building } from "lucide-react";

export const Route = createFileRoute("/properties/")({
  head: () => ({
    meta: [
      { title: "Properties — KodiVault" },
      {
        name: "description",
        content: "Browse verified rental properties with on-chain deposit escrow.",
      },
    ],
  }),
  component: PropertiesPage,
});

const CITIES = ["all", "Nairobi", "Mombasa"];

function PropertiesPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [maxPrice, setMaxPrice] = useState(300000);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", { q, city, maxPrice }],
    queryFn: () => propertyService.list({ q, city, maxPrice }),
  });

  const isLandlord = user?.role === "landlord";

  // Filter items: Landlords only see their own properties, Tenants see all
  const items = useMemo(() => {
    const allProps = data ?? [];
    if (isLandlord && user?.id) {
      return allProps.filter((p: any) => p.landlordId === user.id);
    }
    return allProps;
  }, [data, isLandlord, user?.id]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION - DYNAMIC BASED ON ROLE */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isLandlord ? "My Properties" : "Marketplace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLandlord 
              ? "Manage your property portfolio and add new listings." 
              : "Find a property and lock your deposit in a Solana escrow vault."}
          </p>
        </div>

        {/* ADD PROPERTY BUTTON - ONLY FOR LANDLORDS */}
        {isLandlord && (
          <Button className="bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
            <Link to="/properties/new">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Link>
          </Button>
        )}
      </div>

      {/* FILTERS - ONLY FOR TENANTS/GUESTS */}
      {!isLandlord && (
        <Card className="mt-6 shadow-soft">
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Title, location, neighborhood…"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "all" ? "All cities" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-1.5 md:w-[220px]">
              <label className="text-xs font-medium text-muted-foreground">
                Max rent: KES {maxPrice.toLocaleString()}
              </label>
              <Slider
                value={[maxPrice]}
                min={20000}
                max={300000}
                step={5000}
                onValueChange={(v) => setMaxPrice(v[0])}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* GRID SECTION */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
            ))
          : items.map((p: any) => (
              <Card key={p.id} className="group overflow-hidden border-border shadow-soft transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-emerald px-2.5 py-1 text-xs font-medium text-emerald-foreground shadow-soft">
                    KES {p.monthlyRent.toLocaleString()}/mo
                  </span>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.location}, {p.city}
                  </div>
                  <h3 className="mt-1 text-base font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5" /> {p.bedrooms} bd
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="h-3.5 w-3.5" /> {p.bathrooms} ba
                    </span>
                    <span>Deposit KES {p.depositRequired.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant={isLandlord ? "default" : "outline"} className="flex-1">
                      <Link to="/properties/$propertyId" params={{ propertyId: p.id }}>
                        {isLandlord ? "Manage Listing" : "View Details"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
        {/* EMPTY STATES */}
        {!isLoading && items.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            {isLandlord ? (
              <div className="flex flex-col items-center">
                <Building className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold">No Properties Yet</h3>
                <p className="mb-4 text-sm">You haven't listed any properties on KodiVault.</p>
                <Button className="bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
                  <Link to="/properties/new">Create Your First Listing</Link>
                </Button>
              </div>
            ) : (
              "No properties match your filters."
            )}
          </div>
        )}
      </div>
    </div>
  );
}