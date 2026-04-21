import type { User } from "@/services/types";

export interface AdminDashboardStats {
  totalUsers: number;
  pendingKYC: number;
  totalLeases: number;
  activeDisputes: number;
  escrowVolume: number;
  platformFee: number;
}

export interface KYCQueueItem {
  userId: string;
  userName: string;
  email: string;
  role: "tenant" | "landlord";
  submittedAt: Date;
  documents: KYCDocumentItem[];
  status: "pending" | "verified" | "rejected";
  notes?: string;
}

export interface KYCDocumentItem {
  id: string;
  type: "id_card" | "proof_of_income" | "employment_letter" | "bank_statement";
  url: string;
  uploadedAt: Date;
}

export interface DisputeCaseData {
  id: string;
  leaseId: string;
  tenantName: string;
  landlordName: string;
  propertyAddress: string;
  reason: string;
  description: string;
  raisedAt: Date;
  evidenceCount: number;
  escrowAmount: number;
  status: "open" | "under_review" | "resolved";
  resolution?: string;
}

export interface SystemMetrics {
  activeUsers: number;
  monthlyRevenue: number;
  averageDisputeResolutionTime: number;
  leaseSuccessRate: number;
  platformHealth: "good" | "warning" | "critical";
  recentTransactions: TransactionRecord[];
}

export interface TransactionRecord {
  id: string;
  type: "deposit" | "withdrawal" | "fee" | "refund";
  amount: number;
  currency: "KES" | "SOL";
  description: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
}

export interface AuditLogEntry {
  id: string;
  action: string;
  targetType: "user" | "lease" | "dispute" | "transaction";
  targetId: string;
  performedBy: string;
  changedFields: Record<
    string,
    { oldValue: string | number | boolean; newValue: string | number | boolean }
  >;
  timestamp: Date;
}

export interface AdminSettings {
  minDepositPercentage: number;
  maxDispputeResolutionDays: number;
  platformFeePercentage: number;
  kycRequiredForTenant: boolean;
  kycRequiredForLandlord: boolean;
  autoReleaseEscrowDays: number;
}

export interface AdminProfile {
  userId: string;
  fullName: string;
  email: string;
  role: "super_admin" | "kyo_reviewer" | "dispute_moderator";
  permissions: string[];
  createdAt: Date;
}
