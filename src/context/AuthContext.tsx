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

interface AuthUser {
  name: string;
  complete: boolean;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true); // true hasta que /me responda
  const [error, setError]         = useState<string | null>(null);

  // ── Rehidratación en cada recarga de página ──────────────────────────────
  // Si la cookie de 7 días sigue vigente, /api/me devuelve el usuario
  // y el estado se restaura sin pedirle al usuario que vuelva a iniciar sesión.
  useEffect(() => {
    meRequest()
      .then((me) => {
        if (me) setUser({ name: me.name, complete: me.complete });
      })
      .catch(() => { /* sin cookie válida → usuario null, pantalla de login */ })
      .finally(() => setIsHydrating(false));
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginRequest(credentials);
      setUser({
        name: data.name ?? "Usuario",
        complete: data.complete,
      });
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