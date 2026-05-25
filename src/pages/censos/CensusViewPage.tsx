import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Layers,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { useCensusQuery } from "./hooks/useCensusQuery";
import type { CensusQuerySection } from "./Censos.types";

const inputCls =
  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

function SectionCard({ section }: { section: CensusQuerySection }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-5 border-b border-slate-100 last:border-0">
      <Layers className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-400 font-mono mr-1.5">{section.index}</span>
        <span className="text-sm text-slate-700">{section.name}</span>
      </div>
    </div>
  );
}

export default function CensusViewPage() {
  const { censusId } = useParams<{ censusId: string }>();
  const navigate = useNavigate();

  const {
    modules,
    indicators,
    filtersLoading,
    filtersError,
    selectedModuleId,
    setSelectedModuleId,
    selectedIndicatorId,
    setSelectedIndicatorId,
    requiredAttention,
    setRequiredAttention,
    search,
    setSearch,
    sections,
    queryLoading,
    queryError,
  } = useCensusQuery(censusId);

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
        <div className="min-w-0">
          <p className="text-white font-semibold text-base leading-tight">
            Consulta de censo
          </p>
          <p className="text-white/60 text-xs mt-0.5">
            Filtra y consulta las secciones del censo
          </p>
        </div>
      </div>

      {/* Filters card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-[#7A0C2E]" />
          <span className="text-sm font-semibold text-slate-700">Filtros</span>
          {filtersLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 ml-1" />
          )}
        </div>

        {filtersError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {filtersError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-end">
          {/* Module selector */}
          <div className="flex-[2] min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Módulo <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              disabled={filtersLoading}
              className={inputCls}
            >
              <option value="">— Selecciona un módulo —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Indicator selector */}
          <div className="flex-[2] min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Indicador
            </label>
            <select
              value={selectedIndicatorId}
              onChange={(e) => setSelectedIndicatorId(e.target.value)}
              disabled={filtersLoading || !selectedModuleId}
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
              disabled={filtersLoading || !selectedModuleId}
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
              Buscar por nombre
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre de sección..."
                disabled={filtersLoading || !selectedModuleId}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Empty state — no module selected */}
      {!selectedModuleId && !filtersLoading && (
        <div className="bg-white rounded-xl border border-slate-200 text-center py-14 text-slate-400">
          <Filter className="h-9 w-9 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecciona un módulo para ver las secciones.</p>
        </div>
      )}

      {/* Query loading */}
      {selectedModuleId && queryLoading && (
        <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-14 gap-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Buscando secciones...</span>
        </div>
      )}

      {/* Query error */}
      {selectedModuleId && !queryLoading && queryError && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{queryError}</span>
        </div>
      )}

      {/* Results */}
      {selectedModuleId && !queryLoading && !queryError && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-700">Secciones</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {sections.length} {sections.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              <Layers className="h-9 w-9 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                No se encontraron secciones con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div>
              {sections.map((s) => (
                <SectionCard key={s.id} section={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
