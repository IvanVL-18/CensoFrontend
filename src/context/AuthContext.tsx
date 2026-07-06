import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";

import {
  loginRequest,
  logoutRequest,
  meRequest,
  profileCompletionRequest,
} from "../services/authService";
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
  isLoading: boolean; // login/logout en curso

  isHydrating: boolean; // carga inicial al montar la app
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithToken: (access_token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  markProfileComplete: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toAuthUser(me: MeResponse, complete: boolean): AuthUser {
  return {
    name: me.name ?? "Usuario",
    complete,
    role: me.role,
    permissions: me.permissions ?? [],
  };
}

// /me ya no devuelve la bandera de perfil completo: solo llega en la respuesta
// del login (profile_completed). Se persiste en sessionStorage y, cuando no está
// (recarga con cookie, reset-password), se infiere de /profile-completion.
const PROFILE_COMPLETED_KEY = "profile_completed";
const REQUIRED_PROFILE_FIELDS = [
  "name",
  "lastname",
  "phone",
  "mobile",
  "address",
] as const;

function storeProfileCompleted(completed: boolean) {
  sessionStorage.setItem(PROFILE_COMPLETED_KEY, String(completed));
}

async function resolveProfileCompleted(): Promise<boolean> {
  const stored = sessionStorage.getItem(PROFILE_COMPLETED_KEY);
  if (stored !== null) return stored === "true";

  try {
    const { user_data } = await profileCompletionRequest();
    const completed = REQUIRED_PROFILE_FIELDS.every((f) => !!user_data?.[f]);
    storeProfileCompleted(completed);
    return completed;
  } catch {
    return true; // ante la duda no se muestra el modal; no se cachea el fallo
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true); // true hasta que /me responda
  const loginWithToken = useCallback(async (access_token: string) => {
    sessionStorage.setItem("access_token", access_token);
    const me = await meRequest();
    if (me) setUser(toAuthUser(me, await resolveProfileCompleted()));
  }, []);
  const [error, setError] = useState<string | null>(null);

  // ── Rehidratación en cada recarga de página ──────────────────────────────
  useEffect(() => {
    meRequest()
      .then(async (me) => {
        if (me) setUser(toAuthUser(me, await resolveProfileCompleted()));
      })
      .catch(() => {
        /* sin cookie válida → usuario null, pantalla de login */
      })
      .finally(() => setIsHydrating(false));
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  // Tras el login llamamos a /me para obtener rol y permisos desde un solo lugar.
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { access_token, profile_completed } = await loginRequest(credentials);
      sessionStorage.setItem("access_token", access_token);
      storeProfileCompleted(profile_completed);
      const me = await meRequest();
      if (me) setUser(toAuthUser(me, profile_completed));
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
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem(PROFILE_COMPLETED_KEY);
      setUser(null); // Limpiamos estado aunque el request falle
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const markProfileComplete = useCallback(() => {
    storeProfileCompleted(true);
    setUser((prev) => (prev ? { ...prev, complete: true } : prev));
  }, []);

  // ── Verificación de permisos ─────────────────────────────────────────────
  // Super Admin tiene acceso total sin verificar la lista de permisos.
  // Para el resto se comprueba el array que devuelve el backend en /me.
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === "Super Admin") return true;
      return user.permissions.includes(permission);
    },
    [user],
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
        loginWithToken,
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
  if (!ctx)
    throw new Error("useAuthContext debe usarse dentro de <AuthProvider>");
  return ctx;
}
