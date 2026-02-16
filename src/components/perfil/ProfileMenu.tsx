import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../../components/Perfil/ProfileModal";

export default function ProfileMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const user = {
    firstName: "Ismael",
    lastName: "Reyes García",
    organization: "Gobierno del Estado de Hidalgo",
    jobTitle: "Jefe de oficina",
    email: "ismael3803@gmail.com",
    fixedPhone: "7711777344",
    mobilePhone: "7712345678",
    address: "Dirección de ejemplo 123, Pachuca, Hgo.",
    progress: "Cuestionarios asignados",
    role: "encuestado",
  };

  const roles = [
    { value: "encuestado", label: "Encuestados" },
    { value: "administracion", label: "Administración" },
    { value: "manager", label: "Managers" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials =
    (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
          {initials || <User className="w-4 h-4" />}
        </div>

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-medium truncate max-w-[130px]">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] opacity-80 truncate max-w-[130px]">
            {user.jobTitle || "Usuario"}
          </span>
        </div>

        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Tarjeta de Perfil */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 text-gray-700 z-40">
          <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--pantone-7421)]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate max-w-[150px]">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
          </div>

          <div className="py-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                setModalOpen(true);
                setDropdownOpen(false);
              }}
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>Ver perfil</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      <ProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        roles={roles}
        onRoleChange={(r) => {
          console.log("Nuevo rol seleccionado:", r);
        }}
      />
    </div>
  );
}
