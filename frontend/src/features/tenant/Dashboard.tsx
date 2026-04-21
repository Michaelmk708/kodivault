import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Home,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  FileText,
} from "lucide-react";
import { leaseService } from "@/services";
import type { Lease } from "@/services/types";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    action: "View Details",
  },
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
    action: "View Lease",
  },
  completed: {
    label: "Completed",
    color: "bg-slate-100 text-slate-800",
    icon: FileText,
    action: "View Archive",
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    action: "View Dispute",
  },
};

export function TenantDashboard() {
  const { user } = useAuth();

  const { data: leases, isLoading } = useQuery({
    queryKey: ["tenant-leases", user?.id],
    queryFn: () => leaseService.list(user!.id, "tenant"),
    enabled: !!user,
  });

  const activeLeases = leases?.filter((l) => l.status === "active") || [];
  const pendingLeases = leases?.filter((l) => l.status === "pending") || [];
  const completedLeases = leases?.filter((l) => l.status === "completed") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Leases</h1>
          <p className="text-slate-600">Manage and track your rental agreements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Active Leases" value={activeLeases.length} icon={Home} color="emerald" />
          <StatCard
            title="Pending Approvals"
            value={pendingLeases.length}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Total Monthly Rent"
            value={`KES ${activeLeases
              .reduce((sum, l) => sum + l.monthlyRent, 0)
              .toLocaleString()}`}
            icon={DollarSign}
            color="blue"
          />
          <StatCard
            title="Completed Leases"
            value={completedLeases.length}
            icon={CheckCircle2}
            color="slate"
          />
        </div>

        {/* Pending Actions Alert */}
        {pendingLeases.length > 0 && (
          <Alert className="mb-8 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have <strong>{pendingLeases.length}</strong> lease
              {pendingLeases.length > 1 ? "s" : ""} awaiting action. Complete these to activate
              escrow funding.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Active Leases */}
            {activeLeases.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Active Leases</h2>
                <div className="space-y-4">
                  {activeLeases.map((lease) => (
                    <LeaseCard key={lease.id} lease={lease as Lease} />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Leases */}
            {pendingLeases.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Pending Action</h2>
                <div className="space-y-4">
                  {pendingLeases.map((lease) => (
                    <LeaseCard key={lease.id} lease={lease as Lease} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Leases */}
            {completedLeases.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Completed Leases</h2>
                <div className="space-y-4">
                  {completedLeases.map((lease) => (
                    <LeaseCard key={lease.id} lease={lease as Lease} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!leases ||
              (leases.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Home className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Leases Yet</h3>
                    <p className="text-slate-600 mb-6">Start by browsing available properties</p>
                    <Button className="bg-emerald hover:bg-emerald/90 text-white">
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClass = {
    emerald: "bg-emerald/10 text-emerald",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  }[color];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaseCard({ lease }: { lease: Lease }) {
  const statusConfig = STATUS_CONFIG[lease.status];
  const StatusIcon = statusConfig.icon;
  const daysRemaining = Math.ceil(
    (new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <Home className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{lease.propertyTitle}</h3>
                <p className="text-sm text-slate-600">Landlord: {lease.landlordName}</p>
              </div>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>

            <div className="grid gap-3 mt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-600 mb-1">Monthly Rent</p>
                <p className="text-lg font-semibold text-slate-900">
                  KES {lease.monthlyRent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Security Deposit</p>
                <p className="text-lg font-semibold text-slate-900">
                  KES {lease.depositAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Lease Period</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(lease.startDate).toLocaleDateString()} -{" "}
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Days Remaining</p>
                <p className="text-sm font-medium text-slate-900">
                  {daysRemaining > 0 ? `${daysRemaining} days` : "Completed"}
                </p>
              </div>
            </div>

            {/* Approval Status */}
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                {lease.releaseApprovedByTenant ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span
                  className={lease.releaseApprovedByTenant ? "text-emerald" : "text-yellow-600"}
                >
                  {lease.releaseApprovedByTenant ? "You Approved" : "Pending Your Approval"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {lease.releaseApprovedByLandlord ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                )}
                <span
                  className={lease.releaseApprovedByLandlord ? "text-emerald" : "text-slate-500"}
                >
                  {lease.releaseApprovedByLandlord ? "Landlord Approved" : "Awaiting Landlord"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            <Button className="bg-emerald hover:bg-emerald/90 text-white whitespace-nowrap">
              {statusConfig.action}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {lease.status === "pending" &&
              lease.releaseApprovedByLandlord &&
              !lease.escrowFunded && (
                <Button variant="outline" className="whitespace-nowrap">
                  Fund Escrow
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
