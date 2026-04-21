import { useQuery } from "@tanstack/react-query";
import { adminService, leaseService, disputeService } from "@/services";

/**
 * Fetch list of all users for admin management
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.listUsers(),
  });
}

/**
 * Fetch all leases for admin overview
 */
export function useAdminLeases() {
  return useQuery({
    queryKey: ["admin-leases"],
    queryFn: async () => {
      // Admin sees all leases across platform
      // This might be a dedicated admin endpoint
      return [];
    },
  });
}

/**
 * Fetch all disputes for admin review
 */
export function useAdminDisputes() {
  return useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      // Fetch all disputes from all users for admin review
      return [];
    },
  });
}

/**
 * Fetch pending KYC verifications
 */
export function usePendingKYC() {
  return useQuery({
    queryKey: ["admin-pending-kyc"],
    queryFn: async () => {
      // Fetch users with pending KYC status
      const users = await adminService.listUsers();
      return users.filter((u) => !u.verified);
    },
  });
}

/**
 * Fetch system metrics and analytics
 */
export function useSystemMetrics() {
  return useQuery({
    queryKey: ["admin-system-metrics"],
    queryFn: async () => {
      // Mock metrics - would be a dedicated admin endpoint in production
      return {
        activeUsers: 0,
        monthlyRevenue: 0,
        averageDisputeResolutionTime: 0,
        leaseSuccessRate: 0,
        platformHealth: "good" as const,
        recentTransactions: [],
      };
    },
  });
}
