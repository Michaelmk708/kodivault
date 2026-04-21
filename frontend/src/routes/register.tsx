import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { toast } from "sonner";
import type { Role } from "@/services/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — KodiVault" },
      { name: "description", content: "Create a KodiVault tenant or landlord account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<Role>("tenant");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    nationalId: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await register({ ...form, role });
      toast.success("Account created");
      navigate({ to: "/leases" });
    } catch (err) {
      toast.error((err as Error).message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="shadow-soft">
        <CardHeader className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join KodiVault as a tenant or landlord.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>I am a…</Label>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as Role)}
                className="grid grid-cols-2 gap-3"
              >
                {(["tenant", "landlord"] as const).map((r) => (
                  <label
                    key={r}
                    htmlFor={`role-${r}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      role === r
                        ? "border-emerald bg-emerald-soft/40"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem id={`role-${r}`} value={r} />
                    <div>
                      <div className="text-sm font-medium capitalize">{r}</div>
                      <div className="text-xs text-muted-foreground">
                        {r === "tenant" ? "Looking to rent" : "Listing properties"}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={form.fullName} onChange={update("fullName")} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={update("email")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (verification)</Label>
                <Input
                  id="phone"
                  placeholder="+254 700 000 000"
                  value={form.phone}
                  onChange={update("phone")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nationalId">National ID (verification)</Label>
                <Input id="nationalId" value={form.nationalId} onChange={update("nationalId")} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Phone & National ID are used for KYC verification. An admin will review and approve
              your account.
            </p>

            <Button
              type="submit"
              className="w-full bg-emerald text-emerald-foreground hover:bg-emerald/90"
              disabled={busy}
            >
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-emerald hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
