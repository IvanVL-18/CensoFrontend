import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Layers,
} from "lucide-react";
import { useCensusView } from "./hooks/useCensusView";
import type { CensusViewModuleItem, CensusViewSectionItem } from "./Censos.types";


function SectionRow({ item }: { item: CensusViewSectionItem }) {
  const { section } = item;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Layers className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-400 font-mono mr-1.5">{section.index}</span>
        <span className="text-sm text-slate-700">{section.name}</span>
      </div>
    </div>
  );
}

function ModulePanel({ item }: { item: CensusViewModuleItem }) {
  const [open, setOpen] = useState(true);
  const { module, census_sections } = item;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <BookOpen className="h-5 w-5 text-[#7A0C2E] shrink-0" />
        <span className="flex-1 text-sm font-semibold text-slate-800 truncate">
          <span className="text-xs text-slate-400 font-mono mr-1.5">{module.index}</span>
          {module.name}
        </span>
        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {census_sections.length} {census_sections.length === 1 ? "sección" : "secciones"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && census_sections.length > 0 && (
        <div className="px-5 pb-3 bg-slate-50 border-t border-slate-100">
          <div className="pt-2">
            {census_sections.map((s) => (
              <SectionRow key={s.section.id} item={s} />
            ))}
          </div>
        </div>
      )}

      {open && census_sections.length === 0 && (
        <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 border-t border-slate-100">
          Sin secciones asignadas a este módulo.
        </p>
      )}
    </div>
  );
}


export default function CensusViewPage() {
  const { censusId } = useParams<{ censusId: string }>();
  const navigate = useNavigate();

  const { modules, loading, error } = useCensusView(censusId);

  const totalSections = modules.reduce(
    (acc, m) => acc + m.census_sections.length,
    0,
  );

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
        <span className="font-medium text-slate-800">Ver censo</span>
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
            Estructura del censo
          </p>
          {!loading && !error && (
            <p className="text-white/60 text-xs mt-0.5">
              {modules.length} {modules.length === 1 ? "módulo" : "módulos"} · {totalSections}{" "}
              {totalSections === 1 ? "sección" : "secciones"}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-20 gap-2 text-slate-400">
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

      {/* Content */}
      {!loading && !error && (
        <>
          {modules.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 text-center py-16 text-slate-400">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay módulos asignados a este censo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((m) => (
                <ModulePanel key={m.module.id} item={m} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
