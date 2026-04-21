import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/new")({
  component: AddPropertyPage,
});

function AddPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");

 const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Actually call the Django backend!
      await backendApi.createProperty({
        title,
        location,
        description,
        monthlyRent: parseFloat(rent),
        depositRequired: parseFloat(deposit),
      });
      
      toast.success("Property listed successfully!");
      navigate({ to: "/leases" }); // Redirect back to the Landlord dashboard
    } catch (error) {
      console.error(error);
      toast.error("Failed to list property. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Security check: Only Landlords and Admins should be here
  if (user?.role !== "landlord" && user?.role !== "admin") {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">Only verified landlords can list properties.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">List a New Property</h1>
        <p className="text-muted-foreground">Provide the details for your rental listing to attract verified tenants.</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald" />
            Property Details
          </CardTitle>
          <CardDescription>Enter the primary information for your listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">Listing Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Modern 2-Bedroom Apartment" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="location" 
                  className="pl-9" 
                  placeholder="e.g., Westlands, Nairobi" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent (KES)</Label>
                <Input 
                  id="rent" 
                  type="number" 
                  placeholder="45000" 
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Required Deposit (KES)</Label>
                <Input 
                  id="deposit" 
                  type="number" 
                  placeholder="45000" 
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Property Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the amenities, security, and surrounding area..." 
                className="min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required 
              />
            </div>
<Button 
              type="submit" 
              size="lg"
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={busy}
            >
              {busy ? "Publishing Listing..." : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Publish Property to Marketplace
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}