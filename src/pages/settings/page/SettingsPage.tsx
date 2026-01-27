import { useNavigate } from "react-router-dom";
import { Package, Paperclip, Briefcase, Hash, Layers,  HelpCircle } from "lucide-react";

import SettingsLayout from "../SettingsLayout";
import SettingsGrid from "../SettingsGrid";
import SettingsNavCard from "../SettingsNavCard";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <SettingsLayout title="Configuración del censo">
      <SettingsGrid>
        <SettingsNavCard
          title="Módulos"
          description="Gestiona los módulos/unidades del sistema para organizar la estructura de los censos."
          onClick={() => navigate("/Unidades")}
          icon={<Package className="w-5 h-5 text-[var(--pantone-7421)]" />}
        />

        <SettingsNavCard
          title="Secciones"
          description="Crea y administra las secciones que componen los módulos del censo."
          onClick={() => navigate("/Secciones")}
          icon={<Paperclip className="w-5 h-5 text-[var(--pantone-7421)]" />}
        />

        <SettingsNavCard
          title="Ocupaciones"
          description="Administra el catálogo de ocupaciones utilizado en el censo."
          onClick={() => navigate("/Ocupaciones")}
          className="sm:col-span-2 xl:col-span-1"
          icon={<Briefcase className="w-5 h-5 text-[var(--pantone-7421)]" />}
        />

        <SettingsNavCard
          title="Índices"
          description="Administra los índices numéricos para la estructura del censo."
          onClick={() => navigate("/Indices")}
          icon={<Hash className="w-5 h-5 text-[var(--pantone-7421)]" />}
        />

        {/* ✅ ÁREAS */}
        <SettingsNavCard
          title="Áreas"
          description="Administra las áreas institucionales relacionadas con la estructura del censo."
          onClick={() => navigate("/Area")}
          icon={<Layers className="w-5 h-5 text-[var(--pantone-7421)]" />}
        />

        <SettingsNavCard
          title="Preguntas"
          description="Administra las preguntas que conforman los cuestionarios del censo."
          onClick={() => navigate("/Preguntas")}
          icon={<HelpCircle className="w-5 h-5 text-[var(--pantone-7421)]" />}
        />

      </SettingsGrid>
    </SettingsLayout>
  );
}
