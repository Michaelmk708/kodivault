import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaseService, propertyService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BedDouble, Bath, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$propertyId")({
  head: () => ({
    meta: [{ title: "Property — KodiVault" }],
  }),
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertyService.get(propertyId),
  });

  const lease = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      return leaseService.create({
        propertyId,
        tenantId: user.id,
        tenantName: user.fullName,
      });
    },
    onSuccess: () => {
      toast.success("Lease request created");
      qc.invalidateQueries({ queryKey: ["leases"] });
      navigate({ to: "/leases" });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-12">Loading…</div>;
  }
  if (!property) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p>Property not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/properties">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/properties">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl shadow-soft">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{property.title}</h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {property.location}, {property.city}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-4 w-4" /> {property.bathrooms} bathrooms
            </span>
            <span className="inline-flex items-center gap-1.5">
              Listed by {property.landlordName}
            </span>
          </div>
          <p className="mt-6 text-base leading-relaxed text-foreground/90">
            {property.description}
          </p>
        </div>

        <Card className="h-fit shadow-soft">
          <CardContent className="space-y-5 p-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Monthly rent
              </div>
              <div className="mt-1 text-3xl font-bold">
                KES {property.monthlyRent.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg bg-emerald-soft/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald">
                <ShieldCheck className="h-4 w-4" /> Deposit secured by KodiVault
              </div>
              <div className="mt-1 text-2xl font-semibold">
                KES {property.depositRequired.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Held in a Solana escrow PDA. Released only with mutual approval.
              </p>
            </div>

            {isAuthenticated ? (
              <Button
                className="w-full bg-emerald text-emerald-foreground hover:bg-emerald/90"
                onClick={() => lease.mutate()}
                disabled={lease.isPending || user?.role !== "tenant"}
              >
                {lease.isPending ? "Creating…" : "Request lease"}
              </Button>
            ) : (
              <Button asChild className="w-full bg-emerald text-emerald-foreground hover:bg-emerald/90">
                <Link to="/login" search={{ redirect: `/properties/${propertyId}` }}>
                  Sign in to lease
                </Link>
              </Button>
            )}
            {user?.role && user.role !== "tenant" && (
              <p className="text-xs text-muted-foreground">
                Only tenant accounts can request leases.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
