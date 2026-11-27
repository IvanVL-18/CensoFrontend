import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Building2,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { getCensusInstitutions } from "./AdminAnswers.service";
import type { CensusInstitutionsResponse } from "./AdminAnswers.types";

const backToLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/censos": "Censos",
};

export default function CensusInstitutionsPage() {
  const { censusId } = useParams<{ censusId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("from") ?? "/dashboard";
  const backToLabel = backToLabels[backTo] ?? "Inicio";

  const [data, setData] = useState<CensusInstitutionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!censusId) return;
    setLoading(true);
    setError(null);

    getCensusInstitutions(censusId)
      .then(setData)
      .catch((err) =>
        setError(err?.message ?? "Error al cargar las instituciones."),
      )
      .finally(() => setLoading(false));
  }, [censusId]);

  const handleInstitutionClick = (institutionId: string) => {
    navigate(
      `/admin/censos/${encodeURIComponent(censusId!)}/instituciones/${encodeURIComponent(institutionId)}/usuarios?from=${encodeURIComponent(backTo)}`,
    );
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <button
          onClick={() => navigate(backTo)}
          className="hover:text-slate-800 transition-colors"
        >
          {backToLabel}
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-slate-800 truncate">
          {data?.census.name ?? "Cargando..."}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-slate-400">Instituciones</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#7A0C2E] px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(backTo)}
            className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-white font-semibold text-base leading-tight">
              {data?.census.name ?? "Censo"}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              Selecciona una institución para ver sus respuestas
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando instituciones...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!loading && !error && data?.census.program && data.census.year && (
            <div className="mb-4 rounded-lg border border-[#7A0C2E]/20 bg-[#F7F3E8] px-4 py-3 text-sm text-slate-800">
              Este censo se armó desde los cuadernos del INEGI: sus respuestas son de las instituciones, no de usuarios.{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/cuadernos/respuestas?edicion=${encodeURIComponent(`${data.census.program}-${data.census.year}`)}`)
                }
                className="font-medium text-[#7A0C2E] underline"
              >
                Ver las respuestas por sección
              </button>
            </div>
          )}

          {!loading && !error && data && data.institutions.length === 0 && !data.census.program && (
            <div className="text-center py-16 text-slate-400">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                No hay instituciones asignadas a este censo.
              </p>
            </div>
          )}

          {!loading && !error && data && data.institutions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.institutions.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleInstitutionClick(inst.id)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#7A0C2E] hover:bg-[#7A0C2E]/5 hover:shadow-sm"
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-[#7A0C2E]/10 flex items-center justify-center group-hover:bg-[#7A0C2E]/20 transition">
                    <Building2 className="h-5 w-5 text-[#7A0C2E]" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                    {inst.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#7A0C2E] transition shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
