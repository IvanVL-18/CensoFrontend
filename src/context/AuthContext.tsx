import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";

import { loginRequest, logoutRequest, meRequest } from "../services/authService";
import type { LoginCredentials, MeResponse } from "../services/authService";

interface AuthUser {
  name: string;
  complete: boolean;
  role: string | null;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;       // login/logout en curso
  isHydrating: boolean;     // carga inicial al montar la app
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  markProfileComplete: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toAuthUser(me: MeResponse): AuthUser {
  return {
    name: me.name ?? "Usuario",
    complete: me.complete,
    role: me.role,
    permissions: me.permissions ?? [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [isHydrating, setIsHydrating] = useState(true); // true hasta que /me responda
  const [error, setError]             = useState<string | null>(null);

  // ── Rehidratación en cada recarga de página ──────────────────────────────
  useEffect(() => {
    meRequest()
      .then((me) => { if (me) setUser(toAuthUser(me)); })
      .catch(() => { /* sin cookie válida → usuario null, pantalla de login */ })
      .finally(() => setIsHydrating(false));
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  // Tras el login llamamos a /me para obtener rol y permisos desde un solo lugar.
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginRequest(credentials);
      const me = await meRequest();
      if (me) setUser(toAuthUser(me));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err; // LoginCard lo captura para no navegar
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutRequest(); // Laravel borra el token + cookie
    } finally {
      setUser(null); // Limpiamos estado aunque el request falle
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const markProfileComplete = useCallback(() => {
    setUser((prev) => prev ? { ...prev, complete: true } : prev);
  }, []);

  // ── Verificación de permisos ─────────────────────────────────────────────
  // Super Admin tiene acceso total sin verificar la lista de permisos.
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === "Super Admin") return true;
      return user.permissions.includes(permission);
    },
    [user]
  );

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
        hasPermission,
        markProfileComplete,
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
