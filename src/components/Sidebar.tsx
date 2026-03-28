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
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import ChartTypePopover from "../pages/grapher/components/ChartTypePopover";
import { useAuthContext } from "../context/AuthContext";

type Props = { open: boolean; onToggle: () => void };

// permission: null → visible para cualquier usuario autenticado
// roles: null      → visible para cualquier rol; si se especifica, solo esos roles lo ven
const ALL_ITEMS = [
  { to: "/inicio",        icon: Home,            label: "Inicio",         permission: null,             roles: null },
  { to: "/dashboard",     icon: LayoutDashboard, label: "Dashboard",      permission: "dashboard.view", roles: null },
  { to: "/usuarios",      icon: Users,           label: "Usuarios",       permission: "users.view",     roles: null },
  { to: "/instituciones", icon: Landmark,        label: "Instituciones",  permission: "institutions.view", roles: null },
  { to: "/censos",        icon: ClipboardList,   label: "Censos",         permission: "censos.view",    roles: null },
  { to: "/graficador",    icon: BarChart3,       label: "Graficador",     permission: "graficador.view", roles: null },
  { to: "/reportes",      icon: CalendarRange,   label: "Reportes",       permission: "reports.view",   roles: null },
  { to: "/configuracion", icon: Settings,        label: "Configuración",  permission: null,             roles: ["Admin", "Super Admin"] },
];

export default function Sidebar({ open, onToggle }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, user } = useAuthContext();

  const items = ALL_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(user?.role ?? "")) return false;
    return item.permission === null || hasPermission(item.permission);
  });

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

  return (
    <aside
      className={clsx(
        "h-screen sticky top-0 z-30 bg-[var(--pantone-7421)] text-white",
        open ? "w-50" : "w-22"
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

        <div className="flex-1 overflow-hidden">
          <img
            src="/Hidalgo_log.svg"
            alt="Logo"
            className={clsx(
              "h-6 object-contain transition-all duration-300 ease-out origin-left",
              open
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-3 pointer-events-none"
            )}
          />
        </div>
      </div>

      <nav className="py-2">
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
    </aside>
  );
}
