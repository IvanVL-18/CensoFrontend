import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Paperclip,
  Briefcase,
  Hash,
  Layers,
  HelpCircle,
  Shield,
  FileText,
  UserCog,
  FolderOpen,
  LocateFixed,
} from "lucide-react";

import ConfigurationLayout from "./components/ConfigurationLayout";
import ConfigurationNavCard from "./components/ConfigurationNavCard";
import { useAuthContext } from "../../context/AuthContext";

const ALL_CONFIG_ITEMS = [
  {
    title: "Módulos",
    description: "Organiza la estructura del censo por módulos.",
    to: "/Modulos",
    icon: <Package className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "modules.view",
  },
  {
    title: "Secciones",
    description: "Administra secciones dentro de cada módulo.",
    to: "/secciones",
    icon: <Paperclip className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "sections.view",
  },
  {
    title: "Ocupaciones",
    description: "Gestiona el catálogo de ocupaciones del censo.",
    to: "/ocupaciones",
    icon: <Briefcase className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "occupations.view",
  },
  {
    title: "Índices",
    description: "Configura índices y numeración de la estructura.",
    to: "/indices",
    icon: <Hash className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "indexs.view",
  },
  {
    title: "Dependencias",
    description: "Administra dependencias institucionales vinculadas.",
    to: "/Dependency",
    icon: <Layers className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "dependencie.view",
  },
  {
    title: "Preguntas",
    description: "Crea y gestiona preguntas del cuestionario.",
    to: "/preguntas",
    icon: <HelpCircle className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "questions.view",
  },
  {
    title: "Roles",
    description: "Define roles para controlar accesos por módulo.",
    to: "/roles",
    icon: <UserCog className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "roles.view",
  },
  {
    title: "Catálogos",
    description: "Gestiona catálogos del sistema para formularios.",
    to: "/catalogos",
    icon: <FileText className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "catalogs.view",
  },
  {
    title: "Permisos",
    description: "Configura permisos y acciones disponibles.",
    to: "/permisos",
    icon: <Shield className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "roles.view",
  },
  {
    title: "Categorías",
    description:
      "Administra las categorías del sistema para controlar el acceso a los distintos módulos del censo",
    to: "/categorias",
    icon: <FolderOpen className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "categories.view",
  },

  {
    title: "Indicadores",
    description:
      "Agrega y gestiona indicadores para evaluar la calidad de los datos de las secciones",
    to: "/indicadores",
    icon: <LocateFixed className="w-5 h-5 text-[var(--pantone-7421)]" />,
    permission: "indicators.view",
  },
];

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthContext();

  const items = useMemo(
    () => ALL_CONFIG_ITEMS.filter((item) => hasPermission(item.permission)),
    [hasPermission],
  );

  return (
    <ConfigurationLayout title="Configuración">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item, index) => (
          <ConfigurationNavCard
            key={index}
            {...item}
            onClick={() => navigate(item.to)}
            className="h-full"
          />
        ))}
      </div>
    </ConfigurationLayout>
  );
}
