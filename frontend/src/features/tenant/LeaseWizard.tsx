import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { leaseService, escrowService } from "@/services";

interface LeaseWizardStep {
  id: number;
  title: string;
  description: string;
}

const STEPS: LeaseWizardStep[] = [
  { id: 1, title: "Property Details", description: "Confirm rental terms" },
  { id: 2, title: "Lease Period", description: "Set start and end dates" },
  { id: 3, title: "Special Terms", description: "Add custom agreements" },
  { id: 4, title: "Review & Submit", description: "Finalize and send to landlord" },
];

interface LeaseFormData {
  propertyId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  specialTerms: string;
  notes: string;
}

export function LeaseWizard({
  propertyId,
  landlordId,
}: {
  propertyId: string;
  landlordId: string;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LeaseFormData>({
    propertyId,
    landlordId,
    startDate: "",
    endDate: "",
    monthlyRent: 0,
    depositAmount: 0,
    specialTerms: "",
    notes: "",
  });

  const createLeaseMutation = useMutation({
    mutationFn: async (data: LeaseFormData) => {
      const response = await leaseService.create(data as any);
      // Lease is created with escrow fields pre-populated from Django backend
      // Frontend just records the creation in the UI
      return response;
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createLeaseMutation.mutate(formData);
  };

  const canProceedToNext = validateStep(currentStep, formData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Lease Agreement</h1>
          <p className="text-slate-600">Follow these steps to finalize your rental agreement</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step.id <= currentStep ? "bg-emerald text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.id < currentStep ? <CheckCircle2 className="h-6 w-6" /> : step.id}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step.id < currentStep ? "bg-emerald" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Monthly Rent (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter monthly rent amount"
                    value={formData.monthlyRent}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyRent: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Security Deposit (KES)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter deposit amount"
                    value={formData.depositAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, depositAmount: Number(e.target.value) })
                    }
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Special Terms & Conditions
                  </label>
                  <Textarea
                    placeholder="E.g., No pets, Utilities included, Parking available..."
                    rows={4}
                    value={formData.specialTerms}
                    onChange={(e) => setFormData({ ...formData, specialTerms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Any other information to communicate..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <Alert className="border-emerald/50 bg-emerald/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald" />
                  <AlertDescription>
                    Review your lease details below and submit to send to your landlord
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Rent:</span>
                    <span className="font-semibold">
                      KES {formData.monthlyRent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Security Deposit:</span>
                    <span className="font-semibold">
                      KES {formData.depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
                    <span className="text-slate-600">Total Upfront:</span>
                    <span className="font-bold text-emerald">
                      KES {formData.depositAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-slate-600">Lease Period:</span>
                    <span className="font-semibold">
                      {formData.startDate} to {formData.endDate}
                    </span>
                  </div>
                </div>

                {createLeaseMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {createLeaseMutation.error instanceof Error
                        ? createLeaseMutation.error.message
                        : "Failed to create lease"}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                Back
              </Button>

              {currentStep === STEPS.length ? (
                <Button
                  className="ml-auto bg-emerald hover:bg-emerald/90 text-white"
                  onClick={handleSubmit}
                  disabled={createLeaseMutation.isPending}
                >
                  {createLeaseMutation.isPending ? "Creating..." : "Submit Lease"}
                </Button>
              ) : (
                <Button
                  className="ml-auto bg-emerald hover:bg-emerald/90 text-white"
                  onClick={handleNext}
                  disabled={!canProceedToNext}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function validateStep(step: number, data: LeaseFormData): boolean {
  switch (step) {
    case 1:
      return data.monthlyRent > 0 && data.depositAmount > 0;
    case 2:
      return data.startDate !== "" && data.endDate !== "" && data.startDate < data.endDate;
    case 3:
      return true; // Optional step
    case 4:
      return true; // Review step
    default:
      return false;
  }
}
