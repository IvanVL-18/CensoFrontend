import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  Landmark,
  ClipboardList,
  BarChart3,
  CalendarRange,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package,
  Paperclip 
} from "lucide-react";
import clsx from "clsx";

type Props = { open: boolean; onToggle: () => void };

const items = [
  { to: "/inicio", icon: Home, label: "Inicio" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/usuarios", icon: Users, label: "Usuarios" },
  { to: "/instituciones", icon: Landmark, label: "Instituciones" },
  { to: "/censos", icon: ClipboardList, label: "Censos" },
  { to: "/graficador", icon: BarChart3, label: "Graficador" },
  { to: "/ejercicios-fiscales", icon: CalendarRange, label: "Ejercicios Fiscales" },
  { to: "/ajustes", icon: Settings, label: "Ajustes" },
  { to: "/Unidades", icon: Package, label: "Modulos" },
  { to: "/Secciones", icon: Paperclip, label: "Secciones" },
];

export default function Sidebar({ open, onToggle }: Props) {
  const navigate = useNavigate();

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
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 px-3 py-2.5 mx-4 my-1 rounded-lg transition",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              )
            }
            title={!open ? label : undefined}
          >
            <Icon size={20} className="shrink-0" />
            <span
              className={clsx(
                "text-sm",
                open ? "opacity-100" : "opacity-0 hidden"
              )}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition"
        >
          <LogOut size={20} />
          <span
            className={clsx(
              "text-sm",
              open ? "opacity-100" : "opacity-0 hidden"
            )}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
