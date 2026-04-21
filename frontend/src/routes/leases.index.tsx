import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/leases/")({
  beforeLoad: ({ context }) => {
    const auth = (context as any).auth;
    if (!auth?.isAuthenticated && !localStorage.getItem("kv-jwt")) {
      throw redirect({ to: "/login" });
    }
  },
  component: LeasesDashboard,
});

function LeasesDashboard() {
  const { user } = useAuth();
  
  const { data: leases, isLoading } = useQuery({
    queryKey: ["leases", user?.id],
    queryFn: () => backendApi.listLeases(user?.id || "", user?.role || "tenant"),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  // ==========================================
  // LANDLORD INTERFACE (Fixed: Focused on Escrow & Contracts)
  // ==========================================
  if (user?.role === "landlord") {
    return (
      <div className="container mx-auto max-w-6xl p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Leases</h1>
          <p className="text-muted-foreground">Monitor active tenant agreements and Solana escrow statuses.</p>
        </div>

        {leases?.length === 0 ? (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No Active Leases</h3>
              <p className="mb-4 text-sm text-muted-foreground">You don't have any tenants locked into a contract yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leases?.map((lease) => (
              <Card key={lease.id} className="overflow-hidden shadow-soft transition-all hover:shadow-md">
                <div className="h-32 bg-muted relative">
                  <img src={lease.propertyImage} alt={lease.propertyTitle} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-bold uppercase">
                    {lease.status}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{lease.propertyTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">Tenant: {lease.tenantName}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4 text-sm font-medium">
                    <span>Escrow Locked:</span>
                    <span className="text-emerald">Ksh {lease.depositAmount.toLocaleString()}</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/leases/$leaseId" params={{ leaseId: lease.id }}>
                      View Contract
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TENANT INTERFACE
  // ==========================================
  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Active Leases</h1>
          <p className="text-muted-foreground">Manage your current housing and securely locked deposits.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/properties">Browse Rentals</Link>
        </Button>
      </div>

      {leases?.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-emerald/50" />
            <h3 className="text-lg font-semibold">No Active Leases</h3>
            <p className="mb-4 text-sm text-muted-foreground">You are not currently renting any properties through KodiVault.</p>
            <Button className="bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
              <Link to="/properties">Browse Rentals</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {leases?.map((lease) => (
            <Card key={lease.id} className="overflow-hidden shadow-soft flex flex-row h-48">
              <div className="w-1/3 bg-muted">
                <img src={lease.propertyImage} alt={lease.propertyTitle} className="w-full h-full object-cover" />
              </div>
              <div className="w-2/3 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{lease.propertyTitle}</h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded uppercase font-semibold">{lease.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Landlord: {lease.landlordName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Vaulted Deposit: <span className="text-emerald">Ksh {lease.depositAmount.toLocaleString()}</span></p>
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" asChild>
                    <Link to="/leases/$leaseId" params={{ leaseId: lease.id }}>
                      View Escrow Vault
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}