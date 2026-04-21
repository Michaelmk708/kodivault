import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, Wallet } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-emerald" />
            <span className="inline-block font-bold">KodiVault</span>
          </Link>
          
          {/* ROLE-BASED NAVIGATION */}
          {isAuthenticated && user && (
            <nav className="hidden gap-6 md:flex">
              {user.role === "admin" && (
                <Link to="/admin" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                  Admin Dashboard
                </Link>
              )}
              
              {(user.role === "landlord" || user.role === "tenant") && (
                <>
                  <Link to="/properties" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    {user.role === "landlord" ? "My Properties" : "Browse Rentals"}
                  </Link>
                  <Link to="/leases" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    {user.role === "landlord" ? "Manage Leases" : "My Active Leases"}
                  </Link>
                  <Link to="/disputes" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    Disputes
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:inline-block">
                {user.fullName} <span className="text-xs text-muted-foreground uppercase bg-muted px-2 py-1 rounded ml-1">{user.role}</span>
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}