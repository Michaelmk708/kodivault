import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { disputeService, leaseService } from "@/services";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/disputes/new")({
  validateSearch: (s: Record<string, unknown>): { leaseId?: string } => ({
    leaseId: typeof s.leaseId === "string" ? s.leaseId : undefined,
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("kv-jwt");
      if (!t) throw redirect({ to: "/login", search: { redirect: "/disputes/new" } });
    }
  },
  head: () => ({ meta: [{ title: "New dispute — KodiVault" }] }),
  component: NewDisputePage,
});

function NewDisputePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const search = useSearch({ from: "/disputes/new" });

  const { data: leases } = useQuery({
    queryKey: ["leases", user?.id],
    queryFn: () => (user ? leaseService.list(user.id, user.role) : Promise.resolve([])),
    enabled: !!user,
  });

  const [leaseId, setLeaseId] = useState<string>(search.leaseId ?? "");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);

  const create = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Sign in first");
      if (!leaseId) throw new Error("Select a lease");
      return disputeService.create({
        leaseId,
        raisedBy: user.id,
        raisedByName: user.fullName,
        reason,
        description,
        evidenceUrls: evidence,
      });
    },
    onSuccess: () => {
      toast.success("Dispute submitted");
      qc.invalidateQueries({ queryKey: ["disputes"] });
      qc.invalidateQueries({ queryKey: ["leases"] });
      navigate({ to: "/disputes" });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // For demo: store filenames as evidence references.
    setEvidence((prev) => [...prev, ...files.map((f) => f.name)]);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card className="shadow-soft">
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">Raise a dispute</h1>
          <p className="text-sm text-muted-foreground">
            Provide as much detail as possible. Verified evidence speeds up resolution.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lease</Label>
              <Select value={leaseId} onValueChange={setLeaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lease" />
                </SelectTrigger>
                <SelectContent>
                  {(leases ?? []).map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.propertyTitle} · {l.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Deposit withheld, undisclosed damages, etc."
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                maxLength={2000}
                placeholder="Describe what happened, dates, communications, etc."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Evidence</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted">
                <Upload className="h-4 w-4" />
                Click to upload images, PDFs, or documents
                <input type="file" multiple onChange={onFile} className="hidden" />
              </label>
              {evidence.length > 0 && (
                <ul className="space-y-1.5 text-sm">
                  {evidence.map((e, i) => (
                    <li
                      key={`${e}-${i}`}
                      className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-1.5"
                    >
                      <span className="truncate">{e}</span>
                      <button
                        type="button"
                        onClick={() => setEvidence((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald text-emerald-foreground hover:bg-emerald/90"
              disabled={create.isPending}
            >
              {create.isPending ? "Submitting…" : "Submit dispute"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
