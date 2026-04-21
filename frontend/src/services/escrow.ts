/**
 * Escrow Service - Frontend API integration
 * Handles communication between frontend and Django backend
 * Posts blockchain transactions and receives confirmations
 */

import { api, API_BASE_URL } from "./api";
import type { Lease } from "./types";

export interface EscrowInitializeRequest {
  lease_id: string;
  tx_signature: string;
  contract_pda: string;
  vault_address?: string;
  amount_locked: string; // In SOL as string (e.g., "0.5")
  amount_locked_ksh: string; // In KSH
  exchange_rate: string; // SOL to KSH rate
  metadata?: Record<string, any>;
}

export interface EscrowDepositRequest {
  lease_id: string;
  tx_signature: string;
  amount_deposited: string; // In SOL
  vault_address: string;
  metadata?: Record<string, any>;
}

export interface EscrowApprovalRequest {
  lease_id: string;
  tx_signature: string;
  approver_role: "TENANT" | "LANDLORD";
  metadata?: Record<string, any>;
}

export interface TransactionVerifyRequest {
  tx_signature: string;
}

export interface EscrowResponse {
  tx_hash: string;
  lease_id: string;
  tenant_id: string;
  landlord_id: string;
  contract_pda: string;
  vault_address: string;
  amount_locked: string;
  amount_locked_ksh: string;
  exchange_rate: string;
  status: string;
  is_confirmed: boolean;
  confirmations: number;
  timestamp: string;
}

/**
 * Escrow Service - handles all escrow-related API calls
 */
export const escrowService = {
  /**
   * Initialize a new escrow transaction
   * Called after the user executes initialize_escrow on blockchain
   */
  initialize: async (
    request: EscrowInitializeRequest
  ): Promise<EscrowResponse> => {
    const { data } = await api.post("/escrow/transactions/initialize/", request);
    return data;
  },

  /**
   * Record deposit funds transaction
   * Called after tenant deposits SOL into vault
   */
  recordDeposit: async (request: EscrowDepositRequest): Promise<EscrowResponse> => {
    const { data } = await api.post("/escrow/transactions/deposit/", request);
    return data;
  },

  /**
   * Record approval transaction
   * Called after tenant or landlord approves release
   */
  recordApproval: async (request: EscrowApprovalRequest): Promise<EscrowResponse> => {
    const { data } = await api.post("/escrow/transactions/approve/", request);
    return data;
  },

  /**
   * Verify transaction on blockchain
   * Manual verification of a transaction signature
   */
  verifyTransaction: async (
    request: TransactionVerifyRequest
  ): Promise<{
    valid: boolean;
    confirmed: boolean;
    error?: string;
    confirmations?: number;
    block_height?: number;
  }> => {
    const { data } = await api.post("/escrow/transactions/verify/", request);
    return data;
  },

  /**
   * Get escrow transaction details
   */
  getTransaction: async (txHash: string): Promise<EscrowResponse> => {
    const { data } = await api.get(`/escrow/transactions/${txHash}/`);
    return data;
  },

  /**
   * List all escrow transactions for current user
   */
  listTransactions: async (): Promise<EscrowResponse[]> => {
    const { data } = await api.get("/escrow/transactions/");
    return Array.isArray(data) ? data : data.results || [];
  },

  /**
   * Get escrow transaction logs
   */
  getTransactionLogs: async (txHash: string) => {
    const { data } = await api.get("/escrow/logs/", {
      params: { escrow_tx_hash: txHash },
    });
    return Array.isArray(data) ? data : data.results || [];
  },
};

/**
 * Lease Service extensions for blockchain integration
 */
export const leaseService = {
  /**
   * Update lease with escrow information after blockchain interaction
   */
  updateWithEscrow: async (
    leaseId: string,
    escrowData: {
      escrowPda?: string;
      escrowTxHash?: string;
      escrowFunded?: boolean;
      releaseApprovedByTenant?: boolean;
      releaseApprovedByLandlord?: boolean;
      status?: "pending" | "active" | "completed" | "disputed";
    }
  ): Promise<Lease> => {
    const payload: Record<string, any> = {};

    if (escrowData.escrowPda) payload.escrow_pda = escrowData.escrowPda;
    if (escrowData.escrowTxHash) payload.escrow_tx_hash = escrowData.escrowTxHash;
    if (escrowData.escrowFunded !== undefined) payload.escrow_funded = escrowData.escrowFunded;
    if (escrowData.releaseApprovedByTenant !== undefined)
      payload.tenant_approved = escrowData.releaseApprovedByTenant;
    if (escrowData.releaseApprovedByLandlord !== undefined)
      payload.landlord_approved = escrowData.releaseApprovedByLandlord;
    if (escrowData.status) payload.status = escrowData.status.toUpperCase();

    const { data } = await api.patch(`/leases/${leaseId}/`, payload);
    return data;
  },

  /**
   * Mark lease as active after escrow initialization
   */
  activateLease: async (leaseId: string): Promise<Lease> => {
    const { data } = await api.patch(`/leases/${leaseId}/`, {
      status: "ACTIVE",
    });
    return data;
  },

  /**
   * Complete lease after funds released
   */
  completeLease: async (leaseId: string): Promise<Lease> => {
    const { data } = await api.patch(`/leases/${leaseId}/`, {
      status: "COMPLETED",
    });
    return data;
  },
};

/**
 * Dispute Service
 */
export const disputeService = {
  /**
   * Create a dispute case for an escrow
   */
  createDispute: async (escrowTxHash: string, params: {
    reason: string;
    description: string;
    evidence_urls?: string[];
  }) => {
    const { data } = await api.post("/escrow/disputes/", {
      escrow: escrowTxHash,
      reason: params.reason,
      tenant_statement: params.description,
      tenant_evidence: params.evidence_urls || [],
    });
    return data;
  },

  /**
   * List disputes involving current user
   */
  listDisputes: async () => {
    const { data } = await api.get("/escrow/disputes/");
    return Array.isArray(data) ? data : data.results || [];
  },

  /**
   * Get dispute details
   */
  getDispute: async (disputeId: string) => {
    const { data } = await api.get(`/escrow/disputes/${disputeId}/`);
    return data;
  },

  /**
   * Add landlord statement to dispute
   */
  addLandlordStatement: async (
    disputeId: string,
    statement: string,
    evidence: string[] = []
  ) => {
    const { data } = await api.patch(`/escrow/disputes/${disputeId}/`, {
      landlord_statement: statement,
      landlord_evidence: evidence,
    });
    return data;
  },
};

/**
 * Get current exchange rate for SOL/KSH
 * In production, this would call an external API
 */
export async function getSolKshExchangeRate(): Promise<number> {
  try {
    // For now, use a hardcoded rate
    // In production: fetch from CoinGecko, Binance, or similar
    // https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=ksh
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=ksh"
    );
    const data = await response.json();
    return data.solana.ksh || 50000; // Fallback rate
  } catch (error) {
    console.warn("Failed to fetch exchange rate, using default:", error);
    return 50000; // Default SOL/KSH rate
  }
}

/**
 * Calculate amount in KSH from SOL amount
 */
export async function solToKsh(solAmount: number): Promise<number> {
  const rate = await getSolKshExchangeRate();
  return solAmount * rate;
}

/**
 * Calculate amount in SOL from KSH amount
 */
export async function kshToSol(kshAmount: number): Promise<number> {
  const rate = await getSolKshExchangeRate();
  return kshAmount / rate;
}
