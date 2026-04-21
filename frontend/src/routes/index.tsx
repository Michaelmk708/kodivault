import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Vault, Scale, ArrowRight, Building, Key } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Rent deposits, <span className="text-emerald">secured in a digital vault.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            KodiVault brings complete transparency to renting in Kenya. Tenants lock their deposit safely. Landlords get guaranteed security. When you move out, your money returns automatically. Zero middlemen, zero fraud.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {isAuthenticated ? (
              <Button size="lg" className="bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
                <Link to={user?.role === "admin" ? "/admin" : "/leases"}>
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* DUAL VALUE PROP SECTION */}
      <section className="w-full py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Tenant Side */}
            <Card className="border-border shadow-soft">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-emerald/10 rounded-full">
                  <Key className="h-8 w-8 text-emerald" />
                </div>
                <h3 className="text-2xl font-bold">Peace of Mind for Tenants</h3>
                <p className="text-muted-foreground">
                  Never worry about a rogue landlord withholding your money again. Your deposit is held safely in a neutral digital vault. It cannot be spent, moved, or claimed without mutual agreement or fair mediation.
                </p>
              </CardContent>
            </Card>

            {/* Landlord Side */}
            <Card className="border-border shadow-soft">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Guaranteed Security for Landlords</h3>
                <p className="text-muted-foreground">
                  Ensure your property is protected before handing over the keys. If a tenant damages the property or breaks the lease, the automated vault ensures you are compensated instantly, without chasing payments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-12 text-3xl font-bold">How KodiVault Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4">
              <Vault className="h-12 w-12 text-emerald" />
              <h3 className="text-xl font-semibold">1. Secure the Deposit</h3>
              <p className="text-muted-foreground">The tenant places their deposit into an automated, neutral vault system instead of a personal bank account.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <ShieldCheck className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">2. Live Safely</h3>
              <p className="text-muted-foreground">The funds remain completely untouched and protected by bank-grade logic for the entire duration of the lease.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Scale className="h-12 w-12 text-blue-500" />
              <h3 className="text-xl font-semibold">3. Fast, Fair Returns</h3>
              <p className="text-muted-foreground">At move-out, both parties click a button to release the funds. If there's a disagreement, our fair mediation team steps in.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}