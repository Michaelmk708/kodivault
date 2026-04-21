import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { leaseService, propertyService, disputeService } from "@/services";

/**
 * Fetch all properties owned by landlord
 */
export function useLandlordProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["landlord-properties", user?.id],
    queryFn: () => propertyService.list(),
    enabled: !!user,
  });
}

/**
 * Fetch all leases for landlord's properties
 */
export function useLandlordLeases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["landlord-leases", user?.id],
    queryFn: () => leaseService.list(user!.id, "landlord"),
    enabled: !!user,
  });
}

/**
 * Fetch open disputes for landlord
 */
export function useLandlordDisputes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["landlord-disputes", user?.id],
    queryFn: () => disputeService.list(user!.id, "landlord"),
    enabled: !!user,
  });
}

/**
 * Get single lease details with tenant info
 */
export function useLandlordLease(leaseId: string) {
  return useQuery({
    queryKey: ["landlord-lease", leaseId],
    queryFn: () => leaseService.get(leaseId),
  });
}

/**
 * Get single dispute details
 */
export function useLandlordDispute(disputeId: string) {
  return useQuery({
    queryKey: ["landlord-dispute", disputeId],
    queryFn: async () => {
      // Disputes are typically loaded from the list query
      // Individual dispute details aren't provided by the API
      return null;
    },
  });
}
