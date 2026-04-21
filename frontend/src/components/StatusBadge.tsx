import { Badge } from "@/components/ui/badge";
import type { LeaseStatus, DisputeStatus } from "@/services/types";

const leaseColors: Record<LeaseStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/40",
  active: "bg-emerald-soft text-emerald border-emerald/40",
  completed: "bg-muted text-muted-foreground border-border",
  disputed: "bg-destructive/15 text-destructive border-destructive/40",
};

const disputeColors: Record<DisputeStatus, string> = {
  open: "bg-warning/15 text-warning-foreground border-warning/40",
  under_review: "bg-accent text-accent-foreground border-border",
  resolved: "bg-emerald-soft text-emerald border-emerald/40",
};

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  return (
    <Badge variant="outline" className={`capitalize ${leaseColors[status]}`}>
      {status}
    </Badge>
  );
}

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  return (
    <Badge variant="outline" className={`capitalize ${disputeColors[status]}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}
