import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

interface Props {
  /** Permiso requerido, ej: "censos.ver", "roles.editar".
   *  Si se omite, solo se verifica que el usuario esté autenticado. */
  permission?: string;
}

export default function ProtectedRoute({ permission }: Props) {
  const { isAuthenticated, isHydrating, hasPermission } = useAuthContext();

  // Mientras se verifica la cookie de sesión mostramos un spinner neutral.
  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3E8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#691B31] border-t-transparent" />
      </div>
    );
  }

  // Sin sesión → pantalla de login.
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Con sesión pero sin el permiso necesario → inicio (sin acceso).
  if (permission && !hasPermission(permission)) return <Navigate to="/inicio" replace />;

  return <Outlet />;
}
