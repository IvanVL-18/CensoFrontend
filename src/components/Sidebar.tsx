import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home, LayoutDashboard, Users, Landmark, ClipboardList, BarChart3,
  CalendarRange, Settings, ChevronLeft, ChevronRight, LogOut,Paperclip,Briefcase, Package
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import UserTypePopover from "../pages/users/components/UserTypePopover";

type Props = { open: boolean; onToggle: () => void };

const items = [
  { to: "/inicio", icon: Home, label: "Inicio" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/usuarios", icon: Users, label: "Usuarios" }, // especial
  { to: "/instituciones", icon: Landmark, label: "Instituciones" },
  { to: "/censos", icon: ClipboardList, label: "Censos" },
  { to: "/graficador", icon: BarChart3, label: "Graficador" },
  { to: "/ejercicios-fiscales", icon: CalendarRange, label: "Ejercicios Fiscales" },
  { to: "/Unidades", icon: Package, label: "Modulos" },
  { to: "/Secciones", icon: Paperclip, label: "Secciones" },
  { to: "/Ocupaciones", icon: Briefcase, label: "Ocupaciones" },
  { to: "/ajustes", icon: Settings, label: "Ajustes" },
];

export default function Sidebar({ open, onToggle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para abrir/cerrar el popover de "Usuarios"
  const [usersMenuOpen, setUsersMenuOpen] = useState(false);
  const usersItemRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al hacer click fuera o con Esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!usersItemRef.current) return;
      if (!usersItemRef.current.contains(e.target as Node)) setUsersMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setUsersMenuOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Si cambias de ruta a algo que NO sea /usuarios, cerrar
  useEffect(() => {
    if (!location.pathname.startsWith("/usuarios")) setUsersMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "h-screen sticky top-0 z-30 bg-[#5F0F1B] text-white",
        open ? "w-55" : "w-22"
      )}
    >
      <div className="h-14 flex items-center justify-between px 2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src="/estrella.svg" className="h-12 w-14" alt="Escudo" />
          <div
            className={clsx(
              "font-semibold whitespace-nowrap truncate pr-2",
              open ? "opacity-90 text-xs" : "opacity-0 hidden"
            )}
          >
            Gobierno de Hidalgo
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded hover:bg-white/10 transition"
          aria-label="Contraer/Expandir menú"
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav className="py-4">
        {items.map(({ to, icon: Icon, label }) => {
          // Items normales
          if (label !== "Usuarios") {
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "group flex items-center gap-3 px-3 py-2.5 mx-4 my-1 rounded-lg transition",
                    isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                  )
                }
                title={!open ? label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                <span className={clsx("text-sm", open ? "opacity-100" : "opacity-0 hidden")}>
                  {label}
                </span>
              </NavLink>
            );
          }

          // Item especial: "Usuarios" abre popover por CLICK
          const isActive = location.pathname.startsWith("/usuarios");

          return (
            <div key={to} ref={usersItemRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  // navega a /usuarios solo si no estás ya ahí (evita parpadeo)
                  if (!isActive) navigate("/usuarios");
                  // abre/cierra
                  setUsersMenuOpen((o) => !o);
                }}
                className={clsx(
                  "w-[calc(100%-2rem)] mx-4 my-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition",
                  isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
                title={!open ? label : undefined}
                aria-haspopup="menu"
                aria-expanded={usersMenuOpen}
              >
                <Icon size={20} className="shrink-0" />
                <span className={clsx("text-sm", open ? "opacity-100" : "opacity-0 hidden")}>
                  {label}
                </span>
              </button>

              {usersMenuOpen && (
                <div className="absolute top-0 left-full ml-3 z-50">
                  <UserTypePopover
                    // al seleccionar tipo, navega y cierra
                    onNavigate={() => setUsersMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition"
        >
          <LogOut size={20} />
          <span className={clsx("text-sm", open ? "opacity-100" : "opacity-0 hidden")}>
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
