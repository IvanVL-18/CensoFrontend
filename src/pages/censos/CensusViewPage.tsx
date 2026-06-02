import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Layers,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import AddButton from "../../components/AddButton";
import { useCensusStructure } from "./hooks/useCensusStructure";
import type { CensusViewModuleItem } from "./Censos.types";

const inputCls =
  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

function ModuleBlock({ item }: { item: CensusViewModuleItem }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
      >
        <span className="font-mono text-sm font-bold text-[#7A0C2E] w-8 shrink-0 text-left">
          {item.module.index}
        </span>
        <span className="flex-1 text-sm font-semibold text-slate-800 text-left">
          {item.module.name}
        </span>
        <span className="text-xs text-slate-400 mr-1">
          {item.census_sections.length}{" "}
          {item.census_sections.length === 1 ? "sección" : "secciones"}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {item.census_sections.length === 0 ? (
            <p className="px-14 py-3 text-sm text-slate-400 italic">
              Sin secciones.
            </p>
          ) : (
            item.census_sections.map((s) => (
              <div
                key={s.section.id}
                className="flex items-center gap-3 py-2.5 px-5 pl-14 border-b border-slate-50 last:border-0"
              >
                <Layers className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                <span className="font-mono text-xs text-slate-400 w-12 shrink-0">
                  {s.section.index}
                </span>
                <span className="text-sm text-slate-600">{s.section.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function CensusViewPage() {
  const { censusId } = useParams<{ censusId: string }>();
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("");
  const [requiredAttention, setRequiredAttention] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { modules, moduleOptions, indicators, loading, structureLoading, error } =
    useCensusStructure(censusId, selectedModuleId, selectedIndicatorId, requiredAttention, search);

  function handleModuleChange(id: string) {
    setSelectedModuleId(id);
    setSelectedIndicatorId("");
    setRequiredAttention(undefined);
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button
          onClick={() => navigate("/censos")}
          className="hover:text-slate-800 transition-colors"
        >
          Censos
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-slate-800">Consulta de censo</span>
      </div>

      {/* Header card */}
      <div className="bg-[#7A0C2E] rounded-xl px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/censos")}
          className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-base leading-tight">
            Consulta de censo
          </p>
          <p className="text-white/60 text-xs mt-0.5">
            Filtra y consulta las secciones del censo
          </p>
        </div>
        <AddButton
          label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          onClick={() => setShowFilters((v) => !v)}
          icon={<Filter className="h-4 w-4" />}
          variant="gold"
        />
      </div>

      {/* Filters card */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-[#7A0C2E]" />
            <span className="text-sm font-semibold text-slate-700">Filtros</span>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            {/* Module selector */}
            <div className="flex-[2] min-w-[160px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Módulo
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => handleModuleChange(e.target.value)}
                disabled={structureLoading}
                className={inputCls}
              >
                <option value="">Todos los módulos</option>
                {moduleOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicator selector */}
            <div className="flex-1 min-w-[130px] max-w-[220px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Indicador
              </label>
              <select
                value={selectedIndicatorId}
                onChange={(e) => setSelectedIndicatorId(e.target.value)}
                disabled={structureLoading || !selectedModuleId}
                className={inputCls}
              >
                <option value="">Todos los indicadores</option>
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Required attention toggle */}
            <div className="shrink-0">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Atención requerida
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={requiredAttention === true}
                onClick={() =>
                  setRequiredAttention(requiredAttention === true ? undefined : true)
                }
                disabled={structureLoading || !selectedModuleId}
                className={`flex items-center gap-2 h-[34px] px-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  requiredAttention === true
                    ? "bg-[#7A0C2E] border-[#7A0C2E] text-white"
                    : "bg-gray-50 border-gray-200 text-slate-500 hover:border-[#DDC9A3]"
                }`}
              >
                <div
                  className={`relative w-8 h-[18px] rounded-full transition-colors ${
                    requiredAttention === true ? "bg-white/30" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3.5 h-3.5 rounded-full shadow transition-transform ${
                      requiredAttention === true
                        ? "translate-x-[18px] bg-white"
                        : "translate-x-0.5 bg-white"
                    }`}
                  />
                </div>
                Atención
              </button>
            </div>

            {/* Search */}
            <div className="flex-[2] min-w-[160px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Buscar sección
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre o índice..."
                  disabled={structureLoading}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-14 gap-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Cargando estructura del censo...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        modules.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 text-center py-14 text-slate-400">
            <Layers className="h-9 w-9 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No se encontraron resultados con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((item) => (
              <ModuleBlock key={item.module.id} item={item} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
