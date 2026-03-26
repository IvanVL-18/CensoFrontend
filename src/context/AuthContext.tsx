import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";

import { loginRequest, logoutRequest, meRequest } from "../services/authService";
import type { LoginCredentials } from "../services/authService";

export interface AuthProfile {
  name: string | null;
  lastname: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  profile_completed_at: string | null;
}

export interface AuthUser {
  name: string;
  email: string;
  complete: boolean;
  profile: AuthProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const EMPTY_PROFILE: AuthProfile = {
  name: null,
  lastname: null,
  phone: null,
  mobile: null,
  address: null,
  profile_completed_at: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    meRequest()
      .then((me) => {
        if (!me) return;
        setUser({
          name: me.name ?? "Usuario",
          email: me.email ?? "",
          complete: Boolean(me.complete),
          profile: {
            name: me.profile?.name ?? null,
            lastname: me.profile?.lastname ?? null,
            phone: me.profile?.phone ?? null,
            mobile: me.profile?.mobile ?? null,
            address: me.profile?.address ?? null,
            profile_completed_at: me.profile?.profile_completed_at ?? null,
          },
        });
      })
      .catch(() => {})
      .finally(() => setIsHydrating(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginRequest(credentials);
      setUser({
        name: data.name ?? "Usuario",
        email: data.email ?? credentials.email,
        complete: Boolean(data.complete),
        profile: { ...EMPTY_PROFILE },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isHydrating,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de <AuthProvider>");
  return ctx;
}
