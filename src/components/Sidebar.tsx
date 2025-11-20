import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  Landmark,
  
  Menu,
  ClipboardList, 
  BarChart3,
  CalendarRange, 
  Settings,
  LogOut, 
  Package,
  Paperclip,
  Briefcase
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import ChartTypePopover from "../pages/grapher/components/ChartTypePopover";

type Props = { open: boolean; onToggle: () => void };

const items = [
  { to: "/inicio", icon: Home, label: "Inicio" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/usuarios", icon: Users, label: "Usuarios" }, // normal
  { to: "/instituciones", icon: Landmark, label: "Instituciones" },
  { to: "/censos", icon: ClipboardList, label: "Censos" },
  { to: "/graficador", icon: BarChart3, label: "Graficador" },
  {
    to: "/ejercicios-fiscales",
    icon: CalendarRange,
    label: "Ejercicios Fiscales",
  },
  { to: "/Unidades", icon: Package, label: "Modulos" },
  { to: "/Secciones", icon: Paperclip, label: "Secciones" },
  { to: "/Ocupaciones", icon: Briefcase, label: "Ocupaciones" },
  { to: "/ajustes", icon: Settings, label: "Ajustes" },
];

export default function Sidebar({ open, onToggle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [chartsMenuOpen, setChartsMenuOpen] = useState(false);
  const chartsItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!chartsItemRef.current) return;
      if (!chartsItemRef.current.contains(e.target as Node)) {
        setChartsMenuOpen(false);
      }
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChartsMenuOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith("/graficador")) {
      setChartsMenuOpen(false);
    }
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "h-screen sticky top-0 z-30 bg-[var(--pantone-7421)] text-white",
        open ? "w-55" : "w-22"
      )}
    >
      <div className="h-16 flex items-center gap-2 px-6">
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-white/10 transition"
          aria-label="Contraer/Expandir menú"
        >
          <Menu size={20} />
        </button>

        <div
          className={clsx(
            "font-semibold whitespace-nowrap truncate text-right",
            open ? "opacity-90 text-[14px]" : "opacity-0 hidden"
          )}
        >
          Gobierno del Estado de Hidalgo
        </div>
      </div>

      <nav className="py">
        {items.map(({ to, icon: Icon, label }) => {
          if (label !== "Graficador") {
            return (
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
            );
          }

          const isActive = location.pathname.startsWith("/graficador");

          return (
            <div key={to} ref={chartsItemRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!isActive) navigate("/graficador");
                  setChartsMenuOpen((o) => !o);
                }}
                className={clsx(
                  "w-[calc(100%-2rem)] mx-4 my-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
                title={!open ? label : undefined}
                aria-haspopup="menu"
                aria-expanded={chartsMenuOpen}
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
              </button>

              {chartsMenuOpen && (
                <div className="absolute top-0 left-full ml-3 z-50">
                  <ChartTypePopover
                    onNavigate={() => setChartsMenuOpen(false)}
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
