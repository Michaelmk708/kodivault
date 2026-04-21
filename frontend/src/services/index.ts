import { api, tokenStore, backendApi } from "./api";
import type { AuthResponse, Dispute, Lease, LeaseStatus, Property, Role, User } from "./types";
import * as escrowServiceImpl from "./escrow";
import { SolanaService, solanaService } from "./SolanaService";

export { api, tokenStore, solanaService };
export type { SolanaService };

// All services now use REAL backend - NO MOCK DATA
export const authService = {
  login: (email: string, password: string) => backendApi.login(email, password),
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
    phone?: string;
    nationalId?: string;
  }) => backendApi.register(input),
};

export const propertyService = {
  list: (filters?: { q?: string; city?: string; minPrice?: number; maxPrice?: number }) =>
    backendApi.listProperties(filters),
  get: (id: string) => backendApi.getProperty(id),
};

export const leaseService = {
  list: (userId: string, role: Role) => backendApi.listLeases(userId, role),
  get: (id: string) => backendApi.getLease(id),
  create: (input: { propertyId: string; tenantId: string; tenantName: string }) =>
    backendApi.createLease(input),
  update: (id: string, patch: Partial<Lease>) => backendApi.updateLease(id, patch),
  setStatus: (id: string, status: LeaseStatus) => backendApi.setLeaseStatus(id, status),
  ...escrowServiceImpl.leaseService,
};

// Re-export escrow service with blockchain integration
export const escrowService = escrowServiceImpl.escrowService;

export const disputeService = {
  list: (userId: string, role: Role) => backendApi.listDisputes(userId, role),
  create: (input: {
    leaseId: string;
    raisedBy: string;
    raisedByName: string;
    reason: string;
    description: string;
    evidenceUrls: string[];
  }) => backendApi.createDispute(input),
  resolve: (id: string) => backendApi.resolveDispute(id),
  ...escrowServiceImpl.disputeService,
};

export const adminService = {
  listUsers: () => backendApi.listUsers(),
  verifyUser: (id: string) => backendApi.verifyUser(id),
};

// Exchange rate helpers
export const { getSolKshExchangeRate, solToKsh, kshToSol } = escrowServiceImpl;
