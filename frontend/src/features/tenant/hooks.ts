import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { leaseService, propertyService } from "@/services";
import type { TenantDashboardStats, PropertyBrowseFilters } from "./types";

/**
 * Fetch all properties with optional filters
 */
export function usePropertiesWithFilters(filters?: PropertyBrowseFilters) {
  return useQuery({
    queryKey: ["properties-browsing", filters],
    queryFn: () =>
      propertyService.list({
        q: filters?.search,
        city: filters?.city,
        minPrice: filters?.minPrice || undefined,
        maxPrice: filters?.maxPrice || undefined,
      }),
  });
}

/**
 * Fetch tenant's lease agreements and compute dashboard statistics
 */
export function useTenantLeases() {
  const { user } = useAuth();

  const { data: leases, isLoading } = useQuery({
    queryKey: ["tenant-leases", user?.id],
    queryFn: () => leaseService.list(user!.id, "tenant"),
    enabled: !!user,
  });

  const stats = useMemo<TenantDashboardStats>(() => {
    if (!leases)
      return { activeLeases: 0, pendingLeases: 0, totalMonthlyRent: 0, completedLeases: 0 };

    return {
      activeLeases: leases.filter((l) => l.status === "active").length,
      pendingLeases: leases.filter((l) => l.status === "pending").length,
      totalMonthlyRent: leases
        .filter((l) => l.status === "active")
        .reduce((sum, l) => sum + l.monthlyRent, 0),
      completedLeases: leases.filter((l) => l.status === "completed").length,
    };
  }, [leases]);

  return { leases: leases || [], stats, isLoading };
}

/**
 * Get a single lease with full details
 */
export function useLease(leaseId: string) {
  return useQuery({
    queryKey: ["lease", leaseId],
    queryFn: () => leaseService.get(leaseId),
  });
}

/**
 * Compute days remaining for a lease
 */
export function useDaysRemaining(endDate: string) {
  return useMemo(() => {
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [endDate]);
}
