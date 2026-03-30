import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CompleteProfilePromptModal from "./CompleteProfilePromptModal";
import CompleteProfileModal from "./CompleteProfileModal";
import EditProfileModal from "./EditProfileModal";

import { useAuthContext } from "../../../context/AuthContext";

/** Genera iniciales tomando la primera letra de cada palabra (máx. 2). */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Color de fondo del badge según el rol. */
const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "bg-purple-100 text-purple-700",
  Admin:         "bg-red-100   text-red-700",
  Manager:       "bg-blue-100  text-blue-700",
  Surveyed:      "bg-green-100 text-green-700",
};

export default function ProfileMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [promptOpen,   setPromptOpen]   = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { user, logout } = useAuthContext();

  // Forma que esperan CompleteProfileModal y EditProfileModal
  const modalUser = {
    email: (user as any)?.email ?? "",
    profile: {
      name:     null as string | null,
      lastname: null as string | null,
      phone:    null as string | null,
      mobile:   null as string | null,
      address:  null as string | null,
    },
  };

  const displayName = user?.name  || "Usuario";
  const displayRole = user?.role  || "Sin rol";
  const displayEmail = (user as any)?.email || "";
  const initials    = getInitials(displayName);
  const roleBadge   = ROLE_COLORS[displayRole] ?? "bg-gray-100 text-gray-600";

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("hasSeenCompleteProfileModal");
    if (user && !user.complete && !hasSeenModal) {
      setPromptOpen(true);
      sessionStorage.setItem("hasSeenCompleteProfileModal", "true");
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setPromptOpen(false);
        setCompleteOpen(false);
        setEditOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.removeItem("hasSeenCompleteProfileModal");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleProfileCompleted = (updatedProfile: AuthUser) => {
    setUser(updatedProfile);
    setCompleteOpen(false);
  };

  if (!user) return null; 

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Botón del topbar ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
          {initials || <User className="w-4 h-4" />}
        </div>

        {/* Nombre + rol */}
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-medium truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] opacity-75 truncate max-w-[130px]">
            {displayRole}
          </span>
        </div>

        <ChevronDown className="w-4 h-4" />
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 text-gray-700 z-40">

          {/* Cabecera con info del usuario */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#691B31]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#691B31]">
                {initials || <User className="w-5 h-5" />}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">
                {displayName}
              </span>
              {displayEmail && (
                <span className="text-xs text-gray-400 truncate">
                  {displayEmail}
                </span>
              )}
              <span className={`mt-1 self-start text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadge}`}>
                {displayRole}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="py-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition"
              onClick={() => { setEditOpen(true); setDropdownOpen(false); }}
            >
              <User className="w-4 h-4 text-gray-400" />
              <span>Ver perfil</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modales ──────────────────────────────────────────────────────── */}
      {user && (
        <>
          <CompleteProfilePromptModal
            open={promptOpen}
            onClose={() => setPromptOpen(false)}
            onGoToComplete={() => { setPromptOpen(false); setCompleteOpen(true); }}
          />
          <CompleteProfileModal
            open={completeOpen}
            onClose={() => setCompleteOpen(false)}
            user={modalUser}
          />
          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            user={modalUser}
          />
        </>
      )}
    </div>
  );
}
