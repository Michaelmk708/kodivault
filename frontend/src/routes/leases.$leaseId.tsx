import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { leaseService } from "@/services";
import { VaultCard } from "@/components/VaultCard";
import { LeaseStatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/leases/$leaseId")({
  beforeLoad: ({ params }) => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("kv-jwt");
      if (!t) {
        throw redirect({ to: "/login", search: { redirect: `/leases/${params.leaseId}` } });
      }
    }
  },
  head: () => ({ meta: [{ title: "Lease — KodiVault" }] }),
  component: LeaseDetailPage,
});

function LeaseDetailPage() {
  const { leaseId } = Route.useParams();
  const { user } = useAuth();
  const { data: lease, isLoading } = useQuery({
    queryKey: ["lease", leaseId],
    queryFn: () => leaseService.get(leaseId),
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-12">Loading…</div>;
  if (!lease)
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        Lease not found.{" "}
        <Link to="/leases" className="text-emerald hover:underline">
          Back to leases
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm">
        <Link to="/leases">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to leases
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden shadow-soft">
          <img src={lease.propertyImage} alt={lease.propertyTitle} className="h-48 w-full object-cover" />
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{lease.propertyTitle}</h1>
              <LeaseStatusBadge status={lease.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Tenant" value={lease.tenantName} />
              <Field label="Landlord" value={lease.landlordName} />
              <Field label="Monthly rent" value={`KES ${lease.monthlyRent.toLocaleString()}`} />
              <Field label="Deposit" value={`KES ${lease.depositAmount.toLocaleString()}`} />
              <Field label="Start" value={lease.startDate} />
              <Field label="End" value={lease.endDate} />
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/disputes/new" search={{ leaseId: lease.id }}>
                <AlertTriangle className="mr-1.5 h-4 w-4" /> Raise a dispute
              </Link>
            </Button>
          </CardContent>
        </Card>

        <VaultCard lease={lease} />
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
        Signed in as <strong className="text-foreground">{user?.fullName}</strong> ({user?.role}).
        Only the role(s) involved in this lease can deposit or approve releases.
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
