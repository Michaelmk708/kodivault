export type Role = "tenant" | "landlord" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  nationalId?: string;
  verified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  monthlyRent: number;
  depositRequired: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  landlordId: string;
  landlordName: string;
  available: boolean;
}

export type LeaseStatus = "pending" | "active" | "completed" | "disputed";

export interface Lease {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  status: LeaseStatus;
  escrowPda?: string;
  escrowTxHash?: string;
  escrowFunded: boolean;
  releaseApprovedByTenant: boolean;
  releaseApprovedByLandlord: boolean;
}

export type DisputeStatus = "open" | "under_review" | "resolved";

export interface Dispute {
  id: string;
  leaseId: string;
  raisedBy: string;
  raisedByName: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  createdAt: string;
}
