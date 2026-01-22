// src/pages/settings/page/SettingsPage.tsx
import { useNavigate } from "react-router-dom";
import { Package, Paperclip, Briefcase, Hash } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Configuración del censo
          </h1>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {/* Módulos */}
        <button
          type="button"
          onClick={() => navigate("/Unidades")}
          className="
            w-full text-left
            border border-gray-200 rounded-xl
            p-4 sm:p-5
            hover:border-[var(--pantone-7421)]
            hover:shadow-sm
            transition
            bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/30
          "
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--pantone-7421)]/10 shrink-0">
              <Package className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900">Módulos</h2>
              <p className="text-xs text-gray-500 mt-1">
                Gestiona los módulos/unidades del sistema para organizar la
                estructura de los censos.
              </p>
            </div>
          </div>
        </button>

        {/* Secciones */}
        <button
          type="button"
          onClick={() => navigate("/Secciones")}
          className="
            w-full text-left
            border border-gray-200 rounded-xl
            p-4 sm:p-5
            hover:border-[var(--pantone-7421)]
            hover:shadow-sm
            transition
            bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/30
          "
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--pantone-7421)]/10 shrink-0">
              <Paperclip className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900">Secciones</h2>
              <p className="text-xs text-gray-500 mt-1">
                Crea y administra las secciones que componen los módulos del
                censo.
              </p>
            </div>
          </div>
        </button>

        {/* Ocupaciones */}
        <button
          type="button"
          onClick={() => navigate("/Ocupaciones")}
          className="
            w-full text-left
            border border-gray-200 rounded-xl
            p-4 sm:p-5
            hover:border-[var(--pantone-7421)]
            hover:shadow-sm
            transition
            bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/30
            sm:col-span-2 xl:col-span-1
          "
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--pantone-7421)]/10 shrink-0">
              <Briefcase className="w-5 h-5 text-[var(--pantone-7421)]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900">
                Ocupaciones
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Administra el catálogo de ocupaciones utilizado en el censo.
              </p>
            </div>
          </div>
        </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Índices */}
          <button
            type="button"
            onClick={() => navigate("/Indices")}
            className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-[var(--pantone-7421)] hover:shadow-sm transition bg-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-[var(--pantone-7421)]/10">
                <Hash className="w-5 h-5 text-[var(--pantone-7421)]" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">
                Índices
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Administra los índices numéricos para la estructura del censo.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
