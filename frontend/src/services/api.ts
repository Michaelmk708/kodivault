import axios, { AxiosError } from "axios";
import type {
  AuthResponse,
  Dispute,
  Lease,
  LeaseStatus,
  Property,
  Role,
  User,
} from "./types";

// Real backend integration - NO MOCK DATA
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "kv-jwt";
const REFRESH_KEY = "kv-refresh";

export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  getRefresh: () => (typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY)),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // 1. ADD THIS CHECK: If the 401 is from the login attempt itself, just reject it.
    // Do NOT trigger the forced redirect, let the login page show the error!
    if (originalRequest.url?.includes('/auth/login/') || originalRequest.url?.includes('/auth/register/')) {
        return Promise.reject(error);
    }

    // 2. Existing refresh logic for other routes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = tokenStore.getRefresh();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });
          tokenStore.set(response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch {
        tokenStore.clear();
        window.location.href = "/login";
      }
    }
    
    if (error.response?.status === 401) {
      tokenStore.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const backendApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login/", { email, password });
    tokenStore.set(data.access, data.refresh);
    return {
      token: data.access,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: `${data.user.first_name} ${data.user.last_name}`,
        role: data.user.role.toLowerCase() as Role,
        phone: data.user.phone_number,
        nationalId: data.user.national_id,
        verified: data.user.is_verified,
      },
    };
  },

register: async (input: { email: string; password: string; fullName: string; role: Role; phone?: string; nationalId?: string }): Promise<AuthResponse> => {
    const [firstName, ...lastNameParts] = input.fullName.split(" ");
    
    // 1. Build the base payload
    const payload: any = {
      email: input.email,
      password: input.password,
      first_name: firstName,
      last_name: lastNameParts.join(" ") || firstName,
      role: input.role.toUpperCase(),
    };

    // 2. Only add unique fields if the user actually provided them!
    // This stops the database from crashing over empty strings.
    if (input.phone) payload.phone_number = input.phone;
    if (input.nationalId) payload.national_id = input.nationalId;

    const { data } = await api.post("/auth/register/", payload);
    
    tokenStore.set(data.access, data.refresh);
    return {
      token: data.access,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: `${data.user.first_name} ${data.user.last_name}`,
        role: data.user.role.toLowerCase() as Role,
        phone: data.user.phone_number,
        nationalId: data.user.national_id,
        verified: data.user.is_verified,
      },
    };
  },

  listProperties: async (filters?: { q?: string; city?: string; minPrice?: number; maxPrice?: number }): Promise<Property[]> => {
    const params: any = {};
    if (filters?.q) params.search = filters.q;
    if (filters?.city && filters.city !== "all") params.location = filters.city;
    if (filters?.minPrice) params.min_rent = filters.minPrice;
    if (filters?.maxPrice) params.max_rent = filters.maxPrice;
    const { data } = await api.get("/properties/", { params });
    return (data.results || data).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      city: p.location.split(",")[1]?.trim() || p.location,
      monthlyRent: parseFloat(p.monthly_rent),
      depositRequired: parseFloat(p.required_deposit),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      imageUrl: p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      landlordId: p.landlord,
      landlordName: p.landlord_name || "Property Owner",
      available: p.is_available,
    }));
  },

  getProperty: async (id: string): Promise<Property | null> => {
    try {
      const { data } = await api.get(`/properties/${id}/`);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        location: data.location,
        city: data.location.split(",")[1]?.trim() || data.location,
        monthlyRent: parseFloat(data.monthly_rent),
        depositRequired: parseFloat(data.required_deposit),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        imageUrl: data.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        landlordId: data.landlord,
        landlordName: data.landlord_name || "Property Owner",
        available: data.is_available,
      };
    } catch {
      return null;
    }
  },
  createProperty: async (input: { 
    title: string; 
    description: string; 
    location: string; 
    monthlyRent: number; 
    depositRequired: number 
  }) => {
    const { data } = await api.post("/properties/", {
      title: input.title,
      description: input.description,
      location: input.location,
      monthly_rent: input.monthlyRent,
      required_deposit: input.depositRequired,
      bedrooms: 1, // Defaulting for the MVP
      bathrooms: 1, // Defaulting for the MVP
      is_available: true
    });
    return data;
  },

  listLeases: async (userId: string, role: Role): Promise<Lease[]> => {
    const { data } = await api.get("/leases/");
    return (data.results || data).map((l: any) => ({
      id: l.id,
      propertyId: l.property,
      propertyTitle: l.property_title || "Property",
      propertyImage: l.property_image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      tenantId: l.tenant,
      tenantName: l.tenant_name || "Tenant",
      landlordId: l.landlord,
      landlordName: l.landlord_name || "Landlord",
      monthlyRent: parseFloat(l.monthly_rent),
      depositAmount: parseFloat(l.agreed_deposit),
      startDate: l.start_date,
      endDate: l.end_date,
      status: l.status.toLowerCase() as LeaseStatus,
      escrowPda: l.escrow_pda,
      escrowTxHash: l.escrow_tx_hash,
      escrowFunded: l.escrow_funded || false,
      releaseApprovedByTenant: l.tenant_approved || false,
      releaseApprovedByLandlord: l.landlord_approved || false,
    }));
  },

  getLease: async (id: string): Promise<Lease | null> => {
    try {
      const { data } = await api.get(`/leases/${id}/`);
      return {
        id: data.id,
        propertyId: data.property,
        propertyTitle: data.property_title || "Property",
        propertyImage: data.property_image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        tenantId: data.tenant,
        tenantName: data.tenant_name || "Tenant",
        landlordId: data.landlord,
        landlordName: data.landlord_name || "Landlord",
        monthlyRent: parseFloat(data.monthly_rent),
        depositAmount: parseFloat(data.agreed_deposit),
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status.toLowerCase() as LeaseStatus,
        escrowPda: data.escrow_pda,
        escrowTxHash: data.escrow_tx_hash,
        escrowFunded: data.escrow_funded || false,
        releaseApprovedByTenant: data.tenant_approved || false,
        releaseApprovedByLandlord: data.landlord_approved || false,
      };
    } catch {
      return null;
    }
  },

  createLease: async (input: { propertyId: string; tenantId: string; tenantName: string }) => {
    const { data } = await api.post("/leases/", { property: input.propertyId, tenant: input.tenantId });
    return {
      id: data.id,
      propertyId: data.property,
      propertyTitle: data.property_title,
      propertyImage: data.property_image,
      tenantId: data.tenant,
      tenantName: data.tenant_name,
      landlordId: data.landlord,
      landlordName: data.landlord_name,
      monthlyRent: parseFloat(data.monthly_rent),
      depositAmount: parseFloat(data.agreed_deposit),
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status.toLowerCase() as LeaseStatus,
      escrowFunded: false,
      releaseApprovedByTenant: false,
      releaseApprovedByLandlord: false,
    };
  },

  updateLease: async (id: string, patch: Partial<Lease>) => {
    const { data } = await api.patch(`/leases/${id}/`, patch);
    return data;
  },

  setLeaseStatus: async (id: string, status: LeaseStatus) => {
    const { data } = await api.patch(`/leases/${id}/`, { status: status.toUpperCase() });
    return data;
  },

  listDisputes: async (userId: string, role: Role): Promise<Dispute[]> => {
    const { data } = await api.get("/disputes/");
    return (data.results || data).map((d: any) => ({
      id: d.id,
      leaseId: d.lease,
      raisedBy: d.initiated_by,
      raisedByName: d.initiated_by_name || "User",
      reason: d.reason,
      description: d.tenant_statement || d.landlord_statement || "",
      evidenceUrls: d.tenant_evidence || [],
      status: d.status.toLowerCase().replace("_", " "),
      createdAt: d.created_at,
    }));
  },

  createDispute: async (input: { leaseId: string; raisedBy: string; raisedByName: string; reason: string; description: string; evidenceUrls: string[] }) => {
    const { data } = await api.post("/disputes/", {
      escrow_tx_hash: input.leaseId,
      reason: input.reason,
      tenant_statement: input.description,
      tenant_evidence: input.evidenceUrls,
    });
    return {
      id: data.id,
      leaseId: input.leaseId,
      raisedBy: input.raisedBy,
      raisedByName: input.raisedByName,
      reason: data.reason,
      description: input.description,
      evidenceUrls: input.evidenceUrls,
      status: data.status.toLowerCase(),
      createdAt: data.created_at,
    };
  },

  resolveDispute: async (id: string) => {
    const { data } = await api.post(`/disputes/${id}/resolve/`, {
      resolution_type: "SPLIT",
      tenant_awarded_amount: "50000.00",
      landlord_awarded_amount: "20000.00",
    });
    return data;
  },

  listUsers: async (): Promise<User[]> => {
    const { data } = await api.get("/auth/users/");
    return (data.results || data).map((u: any) => ({
      id: u.id,
      email: u.email,
      fullName: `${u.first_name} ${u.last_name}`,
      role: u.role.toLowerCase() as Role,
      phone: u.phone_number,
      nationalId: u.national_id,
      verified: u.is_verified,
    }));
  },

  verifyUser: async (id: string) => {
    const { data } = await api.post(`/auth/users/${id}/verify/`);
    return data;
  },
};
