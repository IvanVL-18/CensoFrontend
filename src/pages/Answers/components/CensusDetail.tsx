import { ArrowLeft, Loader2 } from "lucide-react";
import type { CensusDetailResponse, CensusQuestion } from "../Answers.types";
import { ModulePanel } from "./ModulePanel";

interface CensusDetailProps {
  detail: CensusDetailResponse | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onOpenQuestion: (question: CensusQuestion) => void;
}

export function CensusDetail({
  detail,
  loading,
  error,
  onBack,
  onOpenQuestion,
}: CensusDetailProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400 gap-2">
        <Loader2 size={24} className="animate-spin" />
        <span>Cargando estructura del censo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 text-sm text-[var(--pantone-7421)] hover:underline"
        >
          ← Volver
        </button>
      </div>
    );
  }

  if (!detail) return null;

  const totalQuestions = detail.modules.reduce(
    (acc, m) =>
      acc + m.sections.reduce((a, s) => a + s.questions.length, 0),
    0
  );
  const answeredQuestions = detail.modules.reduce(
    (acc, m) =>
      acc +
      m.sections.reduce(
        (a, s) => a + s.questions.filter((q) => q.answer !== null).length,
        0
      ),
    0
  );
  const progress =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;

  return (
    <div>
      {/* Cabecera con botón de regreso y título */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg text-gray-500 hover:text-[var(--pantone-7421)] hover:bg-gray-100 transition-colors"
          aria-label="Volver a la lista de censos"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">
            {detail.census.name}
          </h2>
          {detail.census.description && (
            <p className="text-xs text-gray-500 truncate">
              {detail.census.description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-sm font-bold text-[var(--pantone-7421)]">
          {answeredQuestions}/{totalQuestions}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--pantone-7421)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-4">
        {detail.modules.length > 0 ? (
          detail.modules.map((module) => (
            <ModulePanel
              key={module.id}
              module={module}
              onOpenQuestion={onOpenQuestion}
            />
          ))
        ) : (
          <p className="text-sm text-gray-400 italic text-center py-10">
            Este censo no tiene módulos asignados.
          </p>
        )}
      </div>
    </div>
  );
}
