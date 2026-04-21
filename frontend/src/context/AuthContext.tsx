import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services";
import { tokenStore } from "@/services/api";
import type { Role, User } from "@/services/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
    phone?: string;
    nationalId?: string;
  }) => Promise<User>;
  logout: () => void;
  hasRole: (role: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = "kv-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = tokenStore.get();
    const raw = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (t && raw) {
      try {
        setUser(JSON.parse(raw) as User);
        setToken(t);
      } catch {
        tokenStore.clear();
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = (t: string, u: User) => {
    tokenStore.set(t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    persist(res.token, res.user);
    return res.user;
  };

  const register: AuthContextValue["register"] = async (input) => {
    const res = await authService.register(input);
    persist(res.token, res.user);
    return res.user;
  };

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  };

  const hasRole = (role: Role | Role[]) => {
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
