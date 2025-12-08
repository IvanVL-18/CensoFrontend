// src/pages/settings/page/SettingsPage.tsx
import { useNavigate } from "react-router-dom";
import { Package, Paperclip, Briefcase, Settings2 } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Ajustes del sistema
          </h1>
          <p className="text-sm text-gray-500">
            Administra catálogos y configuración avanzada del sistema de censos.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[var(--pantone-7421)]">
          <Settings2 className="w-6 h-6" />
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Módulos */}
        <button
          type="button"
          onClick={() => navigate("/Unidades")}
          className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-[var(--pantone-7421)] hover:shadow-sm transition bg-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-[var(--pantone-7421)]/10">
              <Package className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Módulos</h2>
          </div>
          <p className="text-xs text-gray-500">
            Gestiona los módulos/unidades del sistema para organizar la
            estructura de los censos.
          </p>
        </button>

        {/* Secciones */}
        <button
          type="button"
          onClick={() => navigate("/Secciones")}
          className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-[var(--pantone-7421)] hover:shadow-sm transition bg-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-[var(--pantone-7421)]/10">
              <Paperclip className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Secciones</h2>
          </div>
          <p className="text-xs text-gray-500">
            Crea y administra las secciones que componen los módulos del censo.
          </p>
        </button>

        {/* Ocupaciones */}
        <button
          type="button"
          onClick={() => navigate("/Ocupaciones")}
          className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-[var(--pantone-7421)] hover:shadow-sm transition bg-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-[var(--pantone-7421)]/10">
              <Briefcase className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">
              Ocupaciones
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Administra el catálogo de ocupaciones utilizado en el censo.
          </p>
        </button>
      </div>
    </div>
  );
}
