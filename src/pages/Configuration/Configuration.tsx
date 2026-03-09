import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Paperclip, Briefcase, Hash, Layers, HelpCircle, Shield, FileText, UserCog, FolderOpen} from "lucide-react";

import ConfigurationLayout from "./components/ConfigurationLayout";
import ConfigurationNavCard from "./components/ConfigurationNavCard";

export default function ConfigurationPage() {
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      {
        title: "Módulos",
        description:
          "Gestiona los módulos/Modulos del sistema para organizar la estructura de los censos.",
        to: "/Modulos",
        icon: <Package className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Secciones",
        description: "Crea y administra las secciones que componen los módulos del censo.",
        to: "/Secciones",
        icon: <Paperclip className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Ocupaciones",
        description: "Administra el catálogo de ocupaciones utilizado en el censo.",
        to: "/Ocupaciones",
        className: "sm:col-span-2 xl:col-span-1",
        icon: <Briefcase className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Índices",
        description: "Administra los índices numéricos para la estructura del censo.",
        to: "/Indices",
        icon: <Hash className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Dependencias",
        description: "Administra las Dependencias institucionales relacionadas con la estructura del censo.",
        to: "/Dependency",
        icon: <Layers className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Preguntas",
        description: "Administra las preguntas que conforman los cuestionarios del censo.",
        to: "/Preguntas",
        icon: <HelpCircle className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Roles",
        description: "Administra los roles y permisos del sistema para controlar el acceso a los distintos módulos del censo.",
        to: "/Roles",
        icon: <UserCog className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Catálogos",
        description: "Administra los catalogos y permisos del sistema para controlar el acceso a los distintos módulos del censo.",
        to: "/Catalogos",
        icon: <FileText className="w-5 h-5 text-[var(--pantone-7421)]" />,
      },
      {
        title: "Permisos",
        description: "Administra los permisos del sistema para controlar el acceso a los distintos módulos del censo.",
        to: "/Permisos",
        icon: <Shield className="w-5 h-5 text-[var(--pantone-7421)]" />,  
      },

      {
        title: "Categorías",
        description: "Administra las categorías del sistema para controlar el acceso a los distintos módulos del censo",
        to: "/Categorias",
        icon: <FolderOpen className="w-5 h-5 text-[var(--pantone-7421)]" />,   
      },
         

    ],
    []
  );

  return (
    <ConfigurationLayout title="Configuración">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item, index) => (
          <ConfigurationNavCard key={index} {...item} onClick={() => navigate(item.to)} />
        ))}
      </div>
    </ConfigurationLayout>
  );
}