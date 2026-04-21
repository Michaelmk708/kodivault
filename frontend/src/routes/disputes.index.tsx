import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disputeService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisputeStatusBadge } from "@/components/StatusBadge";
import { Plus, Scale, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/disputes/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("kv-jwt");
      if (!t) throw redirect({ to: "/login", search: { redirect: "/disputes" } });
    }
  },
  head: () => ({ meta: [{ title: "Disputes — KodiVault" }] }),
  component: DisputesPage,
});

function DisputesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["disputes", user?.id],
    queryFn: () => (user ? disputeService.list(user.id, user.role) : Promise.resolve([])),
    enabled: !!user,
  });

  const resolve = useMutation({
    mutationFn: (id: string) => disputeService.resolve(id),
    onSuccess: () => {
      toast.success("Dispute resolved");
      qc.invalidateQueries({ queryKey: ["disputes"] });
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dispute center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Raise and review disputes on your leases.
          </p>
        </div>
        <Button asChild className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
          <Link to="/disputes/new" search={{ leaseId: undefined }}>
            <Plus className="mr-1.5 h-4 w-4" /> New dispute
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))
          : (data ?? []).map((d) => (
              <Card key={d.id} className="shadow-soft">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-soft text-emerald">
                        <Scale className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-semibold">{d.reason}</h3>
                      <DisputeStatusBadge status={d.status} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Lease {d.leaseId} · raised by {d.raisedByName} ·{" "}
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {user?.role === "admin" && d.status !== "resolved" && (
                    <Button
                      variant="outline"
                      onClick={() => resolve.mutate(d.id)}
                      disabled={resolve.isPending}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Resolve
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No disputes. That's a good thing.
          </div>
        )}
      </div>
    </div>
  );
}
