import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Landmark,
  Layers,
  Briefcase,
  UserCog,
  ShieldCheck,
  Package,
  Paperclip,
  HelpCircle,
  FolderOpen,
  FileText,
  Hash,
  BarChart3,
  CalendarRange,
} from "lucide-react";
import { useAuthContext } from "../../../context/AuthContext";

interface Section {
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  permission: string | null; // null = accesible a cualquier usuario autenticado
  color: string;
}

const SECTIONS: Section[] = [
  // ── Principal ────────────────────────────────────────────────────────────
  {
    label: "Dashboard",
    description: "Estadísticas y resumen general",
    icon: LayoutDashboard,
    path: "/dashboard",
    permission: "dashboard.view",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Censos",
    description: "Gestión y seguimiento de censos",
    icon: ClipboardList,
    path: "/censos",
    permission: "censos.view",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    label: "Graficador",
    description: "Visualización de datos y gráficas",
    icon: BarChart3,
    path: "/graficador",
    permission: "graficador.view",
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Reportes",
    description: "Generación y consulta de reportes",
    icon: CalendarRange,
    path: "/reportes",
    permission: "reports.view",
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "Índices",
    description: "Índices y estadísticas avanzadas",
    icon: Hash,
    path: "/indices",
    permission: "indexs.view",
    color: "bg-teal-50 text-teal-600",
  },
  // ── Administración ───────────────────────────────────────────────────────
  {
    label: "Usuarios",
    description: "Administración de cuentas de usuario",
    icon: Users,
    path: "/usuarios",
    permission: "users.view",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Roles",
    description: "Configuración de roles del sistema",
    icon: UserCog,
    path: "/roles",
    permission: "roles.view",
    color: "bg-rose-50 text-rose-600",
  },
  {
    label: "Permisos",
    description: "Gestión de permisos por rol",
    icon: ShieldCheck,
    path: "/permisos",
    permission: "roles.view",
    color: "bg-red-50 text-red-600",
  },
  {
    label: "Instituciones",
    description: "Registro de instituciones",
    icon: Landmark,
    path: "/instituciones",
    permission: "institutions.view",
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Dependencias",
    description: "Administración de dependencias",
    icon: Layers,
    path: "/Dependency",
    permission: "dependencie.view",
    color: "bg-lime-50 text-lime-600",
  },
  {
    label: "Ocupaciones",
    description: "Catálogo de ocupaciones",
    icon: Briefcase,
    path: "/ocupaciones",
    permission: "occupations.view",
    color: "bg-amber-50 text-amber-600",
  },
  // ── Catálogos ────────────────────────────────────────────────────────────
  {
    label: "Módulos",
    description: "Configuración de módulos de censo",
    icon: Package,
    path: "/Modulos",
    permission: "modules.view",
    color: "bg-sky-50 text-sky-600",
  },
  {
    label: "Secciones",
    description: "Secciones de los módulos",
    icon: Paperclip,
    path: "/secciones",
    permission: "sections.view",
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Preguntas",
    description: "Banco de preguntas",
    icon: HelpCircle,
    path: "/preguntas",
    permission: "questions.view",
    color: "bg-pink-50 text-pink-600",
  },
  {
    label: "Categorías",
    description: "Clasificación por categorías",
    icon: FolderOpen,
    path: "/categorias",
    permission: "categories.view",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    label: "Catálogos",
    description: "Catálogos generales del sistema",
    icon: FileText,
    path: "/catalogos",
    permission: "catalogs.view",
    color: "bg-stone-50 text-stone-600",
  },
];

export default function QuickAccess() {
  const { hasPermission } = useAuthContext();
  const navigate = useNavigate();

  const visible = SECTIONS.filter(
    (s) => s.permission === null || hasPermission(s.permission)
  );

  if (!visible.length) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-4 text-center">
        Acceso rápido
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.path}
              type="button"
              onClick={() => navigate(s.path)}
              className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm hover:shadow-md hover:border-[#691B31]/30 hover:-translate-y-0.5 transition-all duration-150"
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-neutral-700 leading-tight">
                {s.label}
              </span>
              <span className="text-[10px] text-neutral-400 leading-snug hidden sm:block">
                {s.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
