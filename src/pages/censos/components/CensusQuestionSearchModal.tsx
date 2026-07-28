import { useEffect, useState } from "react";
import { Eye, Loader2, Search, X } from "lucide-react";
import { findQuestions, getQuestionDetail } from "../Censos.service";
import type {
  CensusOption,
  QuestionDetail,
  QuestionSearchItem,
} from "../Censos.types";
import { QuestionDetailModal } from "./QuestionDetailModal";

interface CensusQuestionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  censo: CensusOption | null;
}

const getQuestionLabel = (item: QuestionSearchItem): string =>
  item.question?.name ?? "(pregunta sin nombre)";

const getQuestionContext = (item: QuestionSearchItem): string | null => {
  const moduleName = item.census_section?.census_module?.module?.name;
  const sectionName = item.census_section?.section?.name;
  const parts = [moduleName, sectionName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
};

export function CensusQuestionSearchModal({
  isOpen,
  onClose,
  censo,
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
      setHasSearched(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "No se pudieron buscar las preguntas.";
      setError(msg);
      setHasSearched(true);
    } finally {
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
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "No se pudo cargar la pregunta.";
      setDetailError(msg);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (!isOpen || !censo) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-[#5b1d27] shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white">Buscar preguntas</h2>
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
              placeholder="Texto a buscar..."
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

        <div className="overflow-y-auto flex-1 px-4 py-3">
          {!hasSearched && !loading && (
            <p className="text-center text-sm text-gray-400 py-6">
              Escribe un texto y presiona buscar.
            </p>
          )}

          {hasSearched && !loading && !error && results.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              No se encontraron preguntas.
            </p>
          )}

          {!error &&
            results.map((item, index) => {
              const context = getQuestionContext(item);
              return (
                <div
                  key={item.id ?? index}
                  className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-200 mb-2 text-sm text-gray-700"
                >
                  <div className="min-w-0">
                    <p>{getQuestionLabel(item)}</p>
                    {context && (
                      <p className="mt-1 text-xs text-gray-400">{context}</p>
                    )}
                  </div>
                  <button
                    onClick={() => void handleViewQuestion(item)}
                    className="shrink-0 h-7 w-7 grid place-items-center rounded-full hover:bg-gray-100 text-[#5b1d27] transition"
                    aria-label={`Ver pregunta ${getQuestionLabel(item)}`}
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
