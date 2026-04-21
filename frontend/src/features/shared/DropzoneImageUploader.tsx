import { useCallback, useState } from "react";
import { Upload, X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DropzoneImageUploaderProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  disabled?: boolean;
  multiple?: boolean;
}

export function DropzoneImageUploader({
  onUpload,
  maxFiles = 5,
  maxFileSize = 10,
  disabled = false,
  multiple = true,
}: DropzoneImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const validated: File[] = [];
      const totalFiles = uploadedFiles.length + files.length;

      if (totalFiles > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return [];
      }

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} is not a valid image file`);
          continue;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
          setError(`${file.name} exceeds ${maxFileSize}MB limit`);
          continue;
        }

        validated.push(file);
      }

      return validated;
    },
    [uploadedFiles.length, maxFiles, maxFileSize],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validatedFiles = validateFiles(files);

      if (validatedFiles.length > 0) {
        const newFiles = multiple ? [...uploadedFiles, ...validatedFiles] : [validatedFiles[0]];
        setUploadedFiles(newFiles);
        onUpload(newFiles);
        setError("");
      }
    },
    [validateFiles, onUpload, uploadedFiles, disabled, multiple],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validatedFiles = validateFiles(files);

      if (validatedFiles.length > 0) {
        const newFiles = multiple ? [...uploadedFiles, ...validatedFiles] : [validatedFiles[0]];
        setUploadedFiles(newFiles);
        onUpload(newFiles);
        setError("");
      }
    },
    [validateFiles, onUpload, uploadedFiles, multiple],
  );

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging ? "border-emerald bg-emerald/5" : "border-slate-300 hover:border-emerald/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <label className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-900 mb-1">
            {multiple ? "Drag files here or click to browse" : "Drag file here or click to browse"}
          </p>
          <p className="text-xs text-slate-500">
            {multiple
              ? `PNG, JPG up to ${maxFileSize}MB (max ${maxFiles} files)`
              : `PNG, JPG up to ${maxFileSize}MB`}
          </p>
          <input
            type="file"
            multiple={multiple}
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-slate-200 rounded transition"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
