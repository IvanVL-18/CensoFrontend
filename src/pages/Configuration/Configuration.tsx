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
  LayoutTemplate,
} from "lucide-react";

import ConfigurationLayout from "./components/ConfigurationLayout";
import ConfigurationNavCard from "./components/ConfigurationNavCard";

export default function ConfigurationPage() {
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      {
        title: "Módulos",
        description: "Organiza la estructura del censo por módulos.",
        to: "/Modulos",
        icon: <Package className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Secciones",
        description: "Administra secciones dentro de cada módulo.",
        to: "/Secciones",
        icon: <Paperclip className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Ocupaciones",
        description: "Gestiona el catálogo de ocupaciones del censo.",
        to: "/Ocupaciones",
        icon: <Briefcase className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Índices",
        description: "Configura índices y numeración de la estructura.",
        to: "/Indices",
        icon: <Hash className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Dependencias",
        description: "Administra dependencias institucionales vinculadas.",
        to: "/Dependency",
        icon: <Layers className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Preguntas",
        description: "Crea y gestiona preguntas del cuestionario.",
        to: "/Preguntas",
        icon: <HelpCircle className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Roles",
        description: "Define roles para controlar accesos por módulo.",
        to: "/Roles",
        icon: <UserCog className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Catálogos",
        description: "Gestiona catálogos del sistema para formularios.",
        to: "/Catalogos",
        icon: <FileText className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Permisos",
        description: "Configura permisos y acciones disponibles.",
        to: "/Permisos",
        icon: <Shield className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Categorías",
        description:
          "Administra las categorías del sistema para controlar el acceso a los distintos módulos del censo",
        to: "/Categorias",
        icon: <FolderOpen className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Items de catalogo",
        description: "Gestiona los items de catalogo.",
        to: "/items-catalogo",
        icon: <LayoutTemplate className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
    ],
    [],
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
