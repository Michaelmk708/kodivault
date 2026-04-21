import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, DollarSign, Search, Filter } from "lucide-react";
import { propertyService } from "@/services";

interface FilterState {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
}

export function BrowseProperties() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", filters],
    queryFn: () =>
      propertyService.list({
        q: filters.search,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
      }),
  });

  const filteredProps = useMemo(() => {
    if (!properties) return [];
    return properties.filter((p) => (filters.bedrooms ? p.bedrooms >= filters.bedrooms : true));
  }, [properties, filters.bedrooms]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Find Your Perfect Home</h1>
          <p className="text-slate-600">Browse verified properties with secure escrow</p>
        </div>

        <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search location..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Input
            placeholder="Min price (KES)"
            type="number"
            value={filters.minPrice || ""}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null })
            }
          />

          <Input
            placeholder="Max price (KES)"
            type="number"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })
            }
          />

          <select
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            value={filters.bedrooms || ""}
            onChange={(e) =>
              setFilters({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">All Bedrooms</option>
            <option value="1">1+ Bedroom</option>
            <option value="2">2+ Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProps.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {!isLoading && filteredProps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No properties match your filters</p>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ search: "", minPrice: null, maxPrice: null, bedrooms: null })
              }
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCard({ property }: { property: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-emerald/20">
      <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
        {property.imageUrl && (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        )}
        <Badge className="absolute top-3 right-3 bg-emerald text-white">Available</Badge>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{property.title}</CardTitle>
        <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
          <MapPin className="h-4 w-4" />
          {property.location}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{property.description}</p>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{property.bedrooms} BR</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{property.bathrooms} BA</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-sm">KES {property.monthlyRent.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-slate-600">Deposit:</span>
            <span className="font-semibold text-emerald">
              KES {property.depositRequired.toLocaleString()}
            </span>
          </div>
        </div>

        <Button className="w-full bg-emerald hover:bg-emerald/90 text-white mt-2">
          View Details & Apply
        </Button>
      </CardContent>
    </Card>
  );
}
