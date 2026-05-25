import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Loader2, AlertCircle, ArrowLeft,
  CheckCircle2, XCircle, BookOpen, Layers, HelpCircle,
} from "lucide-react";
import { getUserAnswers } from "./AdminAnswers.service";
import type { UserAnswersResponse, ModuleItem, SectionItem, QuestionItem } from "./AdminAnswers.types";
import ModalBase from "../../components/Modal";

// ── Subcomponents ────────────────────────────────────────────────────────────

function QuestionRow({ question }: { question: QuestionItem }) {
  const answered = question.answer !== null;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {answered
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <XCircle className="h-4 w-4 text-slate-300" />
          }
        </div>

        {/* Question info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-mono">{question.index}</p>
          <p className="text-sm text-slate-700 mt-0.5">{question.name}</p>
          {question.instructions && (
            <p className="text-xs text-slate-400 mt-0.5 italic">{question.instructions}</p>
          )}
        </div>

        {/* Answer */}
        <div className="shrink-0 ml-2 text-right">
          {answered ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-center rounded-xl px-4 py-2 font-bold transition-colors bg-[#691B31] text-white hover:bg-[#DDC9A3] hover:text-[#691B31]"
            >
              Ver respuesta
            </button>
          ) : (
            <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-xs text-slate-400">
              Sin respuesta
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalBase
  open={modalOpen}
  title={question.name}
  onClose={() => setModalOpen(false)}
  widthClass="max-w-4xl"
>
  <div className="max-h-[70vh] overflow-y-auto">
    <p className="text-xs text-slate-400 font-mono mb-3">{question.index}</p>
    <pre className="text-sm text-slate-700 whitespace-pre-wrap break-words font-sans">
      {question.answer?.answer ?? "Sin respuesta"}
    </pre>
  </div>
</ModalBase>
    </>
  );
}

function SectionPanel({ section }: { section: SectionItem }) {
  const [open, setOpen] = useState(true);
  const total     = section.questions.length;
  const answered  = section.questions.filter((q) => q.answer !== null).length;
  const pct       = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <Layers className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="flex-1 text-sm font-medium text-slate-700 truncate">
          <span className="text-xs text-slate-400 font-mono mr-1.5">{section.index}</span>
          {section.name}
        </span>

        {/* Progress pill */}
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
          pct === 100 ? "bg-emerald-100 text-emerald-700" :
          pct > 0     ? "bg-amber-100  text-amber-700"   :
                        "bg-slate-100  text-slate-500"
        }`}>
          {answered}/{total}
        </span>

        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pt-1 pb-2">
          {section.instructions && (
            <p className="text-xs text-slate-400 italic mb-2 pt-2 border-t border-slate-100">
              {section.instructions}
            </p>
          )}
          {section.questions.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Sin preguntas asignadas.</p>
          ) : (
            section.questions.map((q) => <QuestionRow key={q.id} question={q} />)
          )}
        </div>
      )}
    </div>
  );
}

function ModulePanel({ module }: { module: ModuleItem }) {
  const [open, setOpen] = useState(true);

  const allQuestions = module.sections.flatMap((s) => s.questions);
  const total    = allQuestions.length;
  const answered = allQuestions.filter((q) => q.answer !== null).length;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;

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

        {/* Mini progress bar */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-[#7A0C2E]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
        </div>

        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && module.sections.length > 0 && (
        <div className="px-4 pb-4 space-y-2 bg-slate-50 border-t border-slate-100">
          <div className="pt-3 space-y-2">
            {module.sections.map((s) => <SectionPanel key={s.id} section={s} />)}
          </div>
        </div>
      )}

      {open && module.sections.length === 0 && (
        <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 border-t border-slate-100">
          Sin secciones asignadas a esta institución.
        </p>
      )}
    </div>
  );
}

// ── Progress summary bar ─────────────────────────────────────────────────────

function ProgressBar({ modules }: { modules: ModuleItem[] }) {
  const allQ     = modules.flatMap((m) => m.sections.flatMap((s) => s.questions));
  const total    = allQ.length;
  const answered = allQ.filter((q) => q.answer !== null).length;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          Progreso de respuestas
        </div>
        <span className={`text-sm font-bold ${pct === 100 ? "text-emerald-600" : "text-[#7A0C2E]"}`}>
          {answered} / {total}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-[#7A0C2E]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">
        {pct}% completado
        {pct === 100 && " ✓ Todas las preguntas fueron respondidas"}
      </p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function UserAnswersPage() {
  const { censusId, institutionId, userId } = useParams<{
    censusId: string;
    institutionId: string;
    userId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [data,    setData]    = useState<UserAnswersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!censusId || !institutionId || !userId) return;
    setLoading(true);
    setError(null);

    getUserAnswers(censusId, institutionId, userId)
      .then(setData)
      .catch((err) => setError(err?.message ?? "Error al cargar las respuestas."))
      .finally(() => setLoading(false));
  }, [censusId, institutionId, userId]);

  const backToUsers = () =>
    navigate(
      `/admin/censos/${encodeURIComponent(censusId!)}/instituciones/${encodeURIComponent(institutionId!)}/usuarios?from=${encodeURIComponent(from)}`,
    );

  const fullName = data ? `${data.user.name} ${data.user.lastname}` : "Usuario";

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button onClick={() => navigate(from)} className="hover:text-slate-800 transition-colors">
          {from === "/censos" ? "Censos" : "Dashboard"}
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <button
          onClick={() => navigate(`/admin/censos/${encodeURIComponent(censusId!)}/instituciones?from=${encodeURIComponent(from)}`)}
          className="hover:text-slate-800 transition-colors truncate max-w-[120px]"
        >
          {data?.census.name ?? "Censo"}
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <button onClick={backToUsers} className="hover:text-slate-800 transition-colors truncate max-w-[120px]">
          {data?.institution.name ?? "Institución"}
        </button>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="font-medium text-slate-800 truncate max-w-[120px]">{fullName}</span>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-slate-400">Respuestas</span>
      </div>

      {/* Page header card */}
      <div className="bg-[#7A0C2E] rounded-xl px-5 py-4 flex items-center gap-3">
        <button
          onClick={backToUsers}
          className="rounded-md p-1 text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-white font-semibold text-base leading-tight truncate">{fullName}</p>
          {data && (
            <p className="text-white/60 text-xs mt-0.5 truncate">{data.user.email}</p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-20 gap-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Cargando respuestas...</span>
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
      {!loading && !error && data && (
        <>
          <ProgressBar modules={data.modules} />

          {data.modules.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 text-center py-16 text-slate-400">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay módulos asignados a esta institución.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.modules.map((m) => <ModulePanel key={m.id} module={m} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
