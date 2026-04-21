import type { Lease, Property } from "@/services/types";

export interface TenantDashboardStats {
  activeLeases: number;
  pendingLeases: number;
  totalMonthlyRent: number;
  completedLeases: number;
}

export interface PropertyBrowseFilters {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  city?: string;
}

export interface InspectionPhotoData {
  id: string;
  url: string;
  timestamp: Date;
  category: "condition" | "damage" | "inventory";
  notes: string;
}

export interface InspectionReportData {
  leaseId: string;
  type: "pre-occupancy" | "post-occupancy";
  photos: InspectionPhotoData[];
  summary: string;
  status: "draft" | "submitted" | "reviewed";
}

export interface LeaseAgreementFormData {
  propertyId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  specialTerms: string;
  notes: string;
}

export interface TenantProfile {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  nationalId?: string;
  profileImage?: string;
  verified: boolean;
}
