import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, disputeService, leaseService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeaseStatusBadge, DisputeStatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, ShieldCheck, Users, Vault, Scale } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("kv-jwt");
      if (!t) throw redirect({ to: "/login", search: { redirect: "/admin" } });
      const raw = localStorage.getItem("kv-user");
      if (raw) {
        try {
          const u = JSON.parse(raw) as { role?: string };
          if (u.role !== "admin") throw redirect({ to: "/" });
        } catch {
          throw redirect({ to: "/" });
        }
      }
    }
  },
  head: () => ({ meta: [{ title: "Admin — KodiVault" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const usersQ = useQuery({ queryKey: ["admin", "users"], queryFn: adminService.listUsers });
  const leasesQ = useQuery({
    queryKey: ["admin", "leases"],
    queryFn: () => (user ? leaseService.list(user.id, user.role) : Promise.resolve([])),
    enabled: !!user,
  });
  const disputesQ = useQuery({
    queryKey: ["admin", "disputes"],
    queryFn: () => (user ? disputeService.list(user.id, user.role) : Promise.resolve([])),
    enabled: !!user,
  });

  const verify = useMutation({
    mutationFn: (id: string) => adminService.verifyUser(id),
    onSuccess: () => {
      toast.success("User verified");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
  const resolve = useMutation({
    mutationFn: (id: string) => disputeService.resolve(id),
    onSuccess: () => {
      toast.success("Dispute resolved");
      qc.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin oversight</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify users, monitor leases, and resolve disputes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Users"
          value={usersQ.data?.length ?? 0}
          icon={<Users className="h-5 w-5 text-emerald" />}
        />
        <Stat
          label="Active leases"
          value={(leasesQ.data ?? []).filter((l) => l.status === "active").length}
          icon={<Vault className="h-5 w-5 text-emerald" />}
        />
        <Stat
          label="Open disputes"
          value={(disputesQ.data ?? []).filter((d) => d.status !== "resolved").length}
          icon={<Scale className="h-5 w-5 text-emerald" />}
        />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <h2 className="text-lg font-semibold">Users — KYC verification</h2>
        </CardHeader>
        <CardContent className="divide-y">
          {(usersQ.data ?? []).map((u) => (
            <div key={u.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{u.fullName}</span>
                  <Badge variant="outline" className="capitalize">
                    {u.role}
                  </Badge>
                  {u.verified ? (
                    <Badge className="bg-emerald text-emerald-foreground">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning/40 text-warning-foreground">
                      Unverified
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {u.email} · {u.phone ?? "no phone"} · ID {u.nationalId ?? "—"}
                </div>
              </div>
              {!u.verified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => verify.mutate(u.id)}
                  disabled={verify.isPending}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Verify
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <h2 className="text-lg font-semibold">Leases</h2>
        </CardHeader>
        <CardContent className="divide-y">
          {(leasesQ.data ?? []).map((l) => (
            <div key={l.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{l.propertyTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {l.tenantName} ↔ {l.landlordName} · KES {l.depositAmount.toLocaleString()}
                </div>
              </div>
              <LeaseStatusBadge status={l.status} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <h2 className="text-lg font-semibold">Disputes</h2>
        </CardHeader>
        <CardContent className="divide-y">
          {(disputesQ.data ?? []).map((d) => (
            <div key={d.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{d.reason}</span>
                  <DisputeStatusBadge status={d.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-1 text-xs text-muted-foreground">
                  Lease {d.leaseId} · {d.raisedByName}
                </div>
              </div>
              {d.status !== "resolved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolve.mutate(d.id)}
                  disabled={resolve.isPending}
                >
                  Resolve
                </Button>
              )}
            </div>
          ))}
          {(disputesQ.data ?? []).length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">No disputes.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-soft">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
