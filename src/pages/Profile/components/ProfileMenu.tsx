import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CompleteProfilePromptModal from "./CompleteProfilePromptModal";
import CompleteProfileModal from "./CompleteProfileModal";
import EditProfileModal from "./EditProfileModal";
import { useAuthContext } from "../../../context/AuthContext";
import type { AuthUser } from "../Profile.types";

export default function ProfileMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { user: authUser, logout } = useAuthContext();
  const [user, setUser] = useState<AuthUser | null>(authUser);

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  const jobTitle = "Usuario";
  const displayName = user?.name || "Usuario";
  const initials = displayName.substring(0, 2).toUpperCase();
  const hasUser = !!user;
  const showInitials = !!user?.name && user.name.trim().toLowerCase() !== "usuario";

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("hasSeenCompleteProfileModal");

    if (user && !user.complete && !hasSeenModal) {
      setPromptOpen(true);
      sessionStorage.setItem("hasSeenCompleteProfileModal", "true");
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
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
      console.error("Error al cerrar sesion", error);
    }
  };

  const handleProfileCompleted = (updatedProfile: AuthUser) => {
    setUser(updatedProfile);
    setCompleteOpen(false);
    setPromptOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
          {showInitials ? initials : <User className="w-4 h-4" />}
        </div>

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-medium truncate max-w-[130px]">{displayName}</span>
          <span className="text-[10px] opacity-80 truncate max-w-[130px]">{jobTitle}</span>
        </div>

        <ChevronDown className="w-4 h-4" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 text-gray-700 z-40">
          <div className="px-3 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--pantone-7421)]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate max-w-[150px]">{displayName}</span>
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {user?.email || "Usuario activo"}
              </span>
            </div>
          </div>

          <div className="py-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                if (!hasUser) return;
                setEditOpen(true);
                setDropdownOpen(false);
              }}
              disabled={!hasUser}
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>Ver perfil</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={!hasUser}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      <CompleteProfilePromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onGoToComplete={() => {
          setPromptOpen(false);
          setCompleteOpen(true);
        }}
      />

      {user && (
        <CompleteProfileModal
          open={completeOpen}
          onClose={() => setCompleteOpen(false)}
          user={user}
          onCompleted={handleProfileCompleted}
        />
      )}

      {user && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
