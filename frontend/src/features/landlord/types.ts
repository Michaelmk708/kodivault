import type { Property, Lease, Dispute } from "@/services/types";

export interface LandlordPortfolioStats {
  totalProperties: number;
  activeListings: number;
  totalTenants: number;
  monthlyIncome: number;
  occupancyRate: number;
}

export interface PropertyManagementData {
  id: string;
  title: string;
  address: string;
  rentPerMonth: number;
  occupancyStatus: "vacant" | "occupied" | "maintenance";
  tenantName?: string;
  leaseEndDate?: string;
  maintenanceItems: MaintenanceItem[];
  lastInspection?: Date;
}

export interface MaintenanceItem {
  id: string;
  description: string;
  priority: "low" | "medium" | "high";
  reportedBy: string;
  createdAt: Date;
  status: "pending" | "in_progress" | "completed";
}

export interface TenantManagementData {
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  rentStatus: "paid" | "pending" | "overdue";
  verificationStatus: "pending" | "verified" | "rejected";
}

export interface KYCVerificationData {
  tenantId: string;
  tenantName: string;
  nationalId: string;
  submittedDate: Date;
  status: "pending" | "verified" | "rejected";
  documents: KYCDocument[];
}

export interface KYCDocument {
  id: string;
  type: "id_card" | "proof_of_income" | "employment_letter" | "bank_statement";
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface MarketResearchData {
  location: string;
  averageRent: number;
  demandLevel: "low" | "medium" | "high";
  competitorCount: number;
  averageOccupancyRate: number;
  rentTrend: "increasing" | "stable" | "decreasing";
  recommendations: string[];
}

export interface LandlordProfile {
  userId: string;
  businessName?: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  verified: boolean;
}

export interface DisputeResolutionData {
  leaseId: string;
  tenantName: string;
  propertyAddress: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  proposedResolution?: string;
  status: "open" | "under_review" | "resolved";
  createdAt: Date;
}
