import { NavLink, useNavigate } from "react-router-dom"; // 👈 Importamos useNavigate
import { 
  Home, LayoutDashboard, Users, Landmark, ClipboardList, 
  BarChart3, CalendarRange, Settings, ChevronLeft, ChevronRight, LogOut 
} from "lucide-react";
import clsx from "clsx";

type Props = { open: boolean; onToggle: () => void; };

const items = [
  { to:"/inicio", icon: Home, label:"Inicio" },
  { to:"/dashboard", icon: LayoutDashboard, label:"Dashboard" },
  { to:"/usuarios", icon: Users, label:"Usuarios" },
  { to:"/instituciones", icon: Landmark, label:"Instituciones" },
  { to:"/censos", icon: ClipboardList, label:"Censos" },
  { to:"/graficador", icon: BarChart3, label:"Graficador" },
  { to:"/ejercicios-fiscales", icon: CalendarRange, label:"Ejercicios Fiscales" },
  { to:"/ajustes", icon: Settings, label:"Ajustes" },
];

export default function Sidebar({ open, onToggle }: Props) {
  const navigate = useNavigate(); // 👈 Hook para redirigir

  // 🔹 Función que limpia sesión y redirige
  const handleLogout = () => {
    // Si tienes token guardado:
    localStorage.removeItem("token"); // opcional
    localStorage.removeItem("user");  // opcional
    // Redirigir al login
    navigate("/login");
  };

  return (
    <aside
      className={clsx(
        "h-screen sticky top-0 z-30 bg-[#5F0F1B] text-white transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
        <div className="flex items-center gap-2 overflow-hidden">
          <img src="/estrella.png" className="h-10 w-10" alt="Escudo" />
          <div
            className={clsx(
              "font-semibold tracking-tight whitespace-nowrap",
              open ? "opacity-100" : "opacity-0 hidden"
            )}
          >
            Gobierno de Hidalgo
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-white/10"
          aria-label="Contraer/Expandir menú"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="py-4">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-lg transition",
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

      {/* 🔹 Botón Cerrar sesión */}
      <div className="mt-auto px-2 pb-4">
        <button
          onClick={handleLogout} // 👈 Evento para regresar al login
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/5 hover:text-white"
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
