import type { User } from "@/services/types";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "tenant" | "landlord" | "admin";
  phone?: string;
  nationalId?: string;
  profileImage?: string;
  verified: boolean;
}

export interface NotificationData {
  id: string;
  type: "lease_update" | "escrow_event" | "kyc_update" | "dispute_update" | "message";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

export interface FileUploadProgress {
  filename: string;
  progress: number; // 0-100
  status: "idle" | "uploading" | "completed" | "error";
  error?: string;
}
