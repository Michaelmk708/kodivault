import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { FileUploadProgress } from "./types";

/**
 * Handle image upload to backend with progress tracking
 */
export function useImageUpload() {
  const [progress, setProgress] = useState<Record<string, FileUploadProgress>>({});

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress((prev) => ({
              ...prev,
              [file.name]: {
                filename: file.name,
                progress: percentComplete,
                status: "uploading",
              },
            }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            setProgress((prev) => ({
              ...prev,
              [file.name]: {
                filename: file.name,
                progress: 100,
                status: "completed",
              },
            }));
            resolve(response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          setProgress((prev) => ({
            ...prev,
            [file.name]: {
              filename: file.name,
              progress: 0,
              status: "error",
              error: "Upload failed",
            },
          }));
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/upload/");
        xhr.send(formData);
      });
    },
  });

  const clearProgress = useCallback((filename?: string) => {
    if (filename) {
      setProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[filename];
        return newProgress;
      });
    } else {
      setProgress({});
    }
  }, []);

  return {
    upload: (file: File) => uploadMutation.mutate(file),
    progress,
    clearProgress,
    isLoading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
}

/**
 * Manage local form state with persistence
 */
export function useFormState<T extends Record<string, any>>(initialState: T, storageKey?: string) {
  const [state, setState] = useState<T>(() => {
    if (!storageKey) return initialState;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : initialState;
  });

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setState((prev) => {
        const updated = { ...prev, [field]: value };
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    setState(initialState);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [initialState, storageKey]);

  return { state, setState, setFieldValue, reset };
}

/**
 * Handle async data fetching with retry logic
 */
export function useFetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options?: { retries?: number; retryDelay?: number },
) {
  const { retries = 3, retryDelay = 1000 } = options || {};
  const retryCount = useRef(0);

  return useQuery({
    queryKey: ["fetch-with-retry"],
    queryFn: async () => {
      try {
        return await fetchFn();
      } catch (error) {
        if (retryCount.current < retries) {
          retryCount.current++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          throw error;
        }
        throw error;
      }
    },
    retry: retries,
    retryDelay,
  });
}

/**
 * Handle text clipboard operations
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  return { copy, copied };
}

/**
 * Handle responsive breakpoint detection
 */
export function useBreakpoint(breakpoint: "sm" | "md" | "lg" | "xl") {
  const breakpointMap = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpointMap[breakpoint] : false,
  );

  return isMobile;
}
