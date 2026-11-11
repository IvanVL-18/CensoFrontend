import { useEffect, useState } from "react";
import { Check, Eye, Loader2, Search, X } from "lucide-react";
import clsx from "clsx";
import { findQuestions, getQuestionDetail } from "../Censos.service";
import type {
  CensusOption,
  QuestionDetail,
  QuestionSearchItem,
  SelectedQuestion,
} from "../Censos.types";
import { QuestionDetailModal } from "./QuestionDetailModal";

interface CensusQuestionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  censo: CensusOption | null;
  selectedQuestions: SelectedQuestion[];
  onToggleQuestion: (question: SelectedQuestion) => void;
}

const getQuestionLabel = (item: QuestionSearchItem): string =>
  item.question?.name ?? "(pregunta sin nombre)";

const getQuestionContext = (item: QuestionSearchItem): string | null => {
  const moduleName = item.census_section?.census_module?.module?.name;
  const sectionName = item.census_section?.section?.name;
  const parts = [moduleName, sectionName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
};

/** Sin id de census_question no hay nada que mandar a /compare-questions. */
const toSelectedQuestion = (
  item: QuestionSearchItem,
): SelectedQuestion | null =>
  item.id == null
    ? null
    : {
        id: item.id,
        label: getQuestionLabel(item),
        context: getQuestionContext(item),
      };

const getErrorText = (err: unknown, fallback: string): string => {
  const e = err as {
    response?: { data?: { message?: unknown } };
    message?: unknown;
  };
  const msg = e?.response?.data?.message ?? e?.message;
  return typeof msg === "string" && msg.trim() !== "" ? msg : fallback;
};

export function CensusQuestionSearchModal({
  isOpen,
  onClose,
  censo,
  selectedQuestions,
  onToggleQuestion,
}: CensusQuestionSearchModalProps) {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionSearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [viewingQuestion, setViewingQuestion] =
    useState<QuestionSearchItem | null>(null);
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchText("");
      setError(null);
      setResults([]);
      setHasSearched(false);
      setViewingQuestion(null);
      setQuestionDetail(null);
      setDetailError(null);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!censo || !searchText.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await findQuestions(censo.id, searchText.trim());
      setResults(response.questions ?? []);
    } catch (err) {
      setError(getErrorText(err, "No se pudieron buscar las preguntas."));
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSearch();
    }
  };

  const handleViewQuestion = async (item: QuestionSearchItem) => {
    if (item.question?.id == null) return;

    setViewingQuestion(item);
    setQuestionDetail(null);
    setDetailError(null);
    setLoadingDetail(true);
    try {
      const detail = await getQuestionDetail(item.question.id);
      setQuestionDetail(detail);
    } catch (err) {
      setDetailError(getErrorText(err, "No se pudo cargar la pregunta."));
    } finally {
      setLoadingDetail(false);
    }
  };

  if (!isOpen || !censo) return null;

  const selectedIds = new Set(selectedQuestions.map((q) => q.id));
  const selectedCount = selectedQuestions.length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden"
        role="dialog"
        aria-label={`Elegir preguntas de ${censo.name}`}
      >
        <div className="flex justify-between items-center p-4 bg-[#5b1d27] shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white">Elegir preguntas</h2>
            <p className="text-xs text-white/70 truncate">{censo.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              autoFocus
              placeholder="Busca por una palabra de la pregunta..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[#5b1d27]"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={!searchText.trim() || loading}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#5b1d27] px-4 py-1.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Buscar
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-red-50/60 shrink-0">
            <p className="mb-1 text-xs font-semibold text-gray-600">
              Seleccionadas ({selectedCount})
            </p>
            <ul className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {selectedQuestions.map((question) => (
                <li
                  key={question.id}
                  className="flex items-start justify-between gap-2 text-xs text-gray-700"
                >
                  <span className="line-clamp-2">{question.label}</span>
                  <button
                    onClick={() => onToggleQuestion(question)}
                    className="shrink-0 h-5 w-5 grid place-items-center rounded-full text-red-700 hover:bg-red-100 transition"
                    aria-label={`Quitar ${question.label}`}
                    title="Quitar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-4 py-3">
          {!hasSearched && !loading && (
            <p className="text-center text-sm text-gray-400 py-6">
              Escribe una palabra de la pregunta que buscas y presiona Buscar.
              Toca una pregunta para marcarla o desmarcarla.
            </p>
          )}

          {hasSearched && !loading && !error && results.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              No se encontraron preguntas. Prueba con otra palabra.
            </p>
          )}

          {!error && results.length > 0 && (
            <p className="mb-2 text-xs text-gray-400">
              {results.length} resultado{results.length === 1 ? "" : "s"}
            </p>
          )}

          {!error &&
            results.map((item, index) => {
              const context = getQuestionContext(item);
              const selectable = toSelectedQuestion(item);
              const isSelected =
                selectable !== null && selectedIds.has(selectable.id);
              const toggle = () => {
                if (selectable) onToggleQuestion(selectable);
              };

              return (
                <div
                  key={item.id ?? index}
                  onClick={toggle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle();
                    }
                  }}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-disabled={selectable === null}
                  tabIndex={selectable ? 0 : -1}
                  className={clsx(
                    "flex items-start gap-2 p-3 rounded-lg border-2 mb-2 text-sm text-gray-700 transition-colors",
                    selectable ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                    isSelected
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <span
                    className={clsx(
                      "mt-0.5 h-4 w-4 shrink-0 grid place-items-center rounded border",
                      isSelected
                        ? "border-[#5b1d27] bg-[#5b1d27] text-white"
                        : "border-gray-300 bg-white",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p>{getQuestionLabel(item)}</p>
                    {context && (
                      <p className="mt-1 text-xs text-gray-400">{context}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleViewQuestion(item);
                    }}
                    // Enter/Espacio sobre el botón no deben marcar la pregunta.
                    onKeyDown={(e) => e.stopPropagation()}
                    className="shrink-0 h-7 w-7 grid place-items-center rounded-full hover:bg-gray-100 text-[#5b1d27] transition"
                    aria-label={`Ver pregunta ${getQuestionLabel(item)}`}
                    title="Ver pregunta"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 shrink-0">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[#5b1d27] py-2 text-sm font-medium text-white transition hover:brightness-110 active:scale-95"
          >
            {selectedCount > 0
              ? `Listo · ${selectedCount} pregunta${selectedCount === 1 ? "" : "s"}`
              : "Cerrar"}
          </button>
        </div>
      </div>

      <QuestionDetailModal
        isOpen={viewingQuestion !== null}
        onClose={() => setViewingQuestion(null)}
        loading={loadingDetail}
        error={detailError}
        detail={questionDetail}
        fallbackName={
          viewingQuestion ? getQuestionLabel(viewingQuestion) : undefined
        }
      />
    </div>
  );
}
