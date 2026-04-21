import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, AlertCircle, Trash2, Eye } from "lucide-react";

interface InspectionPhoto {
  id: string;
  url: string;
  timestamp: Date;
  category: "condition" | "damage" | "inventory";
  notes: string;
}

interface InspectionReport {
  leaseId: string;
  type: "pre-occupancy" | "post-occupancy";
  photos: InspectionPhoto[];
  summary: string;
  status: "draft" | "submitted" | "reviewed";
}

const INSPECTION_CATEGORIES = [
  { id: "condition", label: "General Condition", color: "bg-blue-100 text-blue-800" },
  { id: "damage", label: "Damage/Issues", color: "bg-red-100 text-red-800" },
  { id: "inventory", label: "Inventory", color: "bg-green-100 text-green-800" },
];

export function InspectionFlow({
  leaseId,
  inspectionType,
}: {
  leaseId: string;
  inspectionType: "pre-occupancy" | "post-occupancy";
}) {
  const [photos, setPhotos] = useState<InspectionPhoto[]>([]);
  const [summary, setSummary] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<InspectionPhoto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("condition");

  const submitMutation = useMutation({
    mutationFn: async (report: InspectionReport) => {
      const response = await fetch(`/api/leases/${leaseId}/inspections/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: report.type,
          photos: report.photos,
          summary: report.summary,
        }),
      });
      return response.json();
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photo: InspectionPhoto = {
          id: Math.random().toString(),
          url: event.target?.result as string,
          timestamp: new Date(),
          category: selectedCategory as any,
          notes: "",
        };
        setPhotos([...photos, photo]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      alert("Please add at least one inspection photo");
      return;
    }

    submitMutation.mutate({
      leaseId,
      type: inspectionType,
      photos,
      summary,
      status: "submitted",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {inspectionType === "pre-occupancy" ? "Pre-Occupancy" : "Post-Occupancy"} Inspection
          </h1>
          <p className="text-slate-600">
            Document the property condition with photos for dispute resolution
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Photo Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Inspection Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Photo Category
                  </label>
                  <div className="flex gap-2">
                    {INSPECTION_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          selectedCategory === cat.id
                            ? "bg-emerald text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald transition">
                  <label className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-900">Click to upload photos</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                {/* Inspection Summary */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Inspection Summary
                  </label>
                  <textarea
                    placeholder="Describe the overall condition of the property..."
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos ({photos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-lg overflow-hidden bg-slate-100"
                      >
                        <img
                          src={photo.url}
                          alt="inspection"
                          className="w-full h-40 object-cover cursor-pointer hover:opacity-75 transition"
                          onClick={() => setPreviewPhoto(photo)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPreviewPhoto(photo)}
                            className="p-2 bg-white rounded-full hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        <Badge
                          className={`absolute top-2 right-2 ${
                            INSPECTION_CATEGORIES.find((c) => c.id === photo.category)?.color
                          }`}
                        >
                          {INSPECTION_CATEGORIES.find((c) => c.id === photo.category)?.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Section */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                Save as Draft
              </Button>
              <Button
                className="flex-1 bg-emerald hover:bg-emerald/90 text-white"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || photos.length === 0}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Inspection"}
              </Button>
            </div>

            {submitMutation.isSuccess && (
              <Alert className="border-emerald/50 bg-emerald/5">
                <CheckCircle2 className="h-4 w-4 text-emerald" />
                <AlertDescription>
                  Inspection submitted successfully. Landlord will review within 48 hours.
                </AlertDescription>
              </Alert>
            )}

            {submitMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to submit inspection. Please try again.</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Photo Preview Modal */}
          {previewPhoto && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Photo Preview</CardTitle>
                  <button
                    onClick={() => setPreviewPhoto(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </CardHeader>
                <CardContent>
                  <img
                    src={previewPhoto.url}
                    alt="preview"
                    className="w-full h-96 object-contain bg-slate-100 rounded-lg"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Category:</span>
                      <Badge>
                        {INSPECTION_CATEGORIES.find((c) => c.id === previewPhoto.category)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Uploaded:</span>
                      <span className="text-sm font-medium">
                        {new Date(previewPhoto.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sidebar - Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inspection Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">General Condition</h4>
                <p className="text-sm text-slate-600">
                  Document walls, floors, ceilings, doors, and windows. Capture the overall state.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Damage/Issues</h4>
                <p className="text-sm text-slate-600">
                  Photograph any scratches, stains, broken items, or maintenance issues clearly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Inventory</h4>
                <p className="text-sm text-slate-600">
                  Document appliances, furniture, and included items with serial numbers if visible.
                </p>
              </div>
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-800">
                  Dates and timestamps are automatically included with each photo for legal
                  verification.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
