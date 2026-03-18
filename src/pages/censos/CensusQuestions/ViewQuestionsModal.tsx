import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../lib/Axios";

interface QuestionDetail {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ViewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "Fecha inválida";
  }
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const safeValue = value?.trim() ? value : "N/A";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="text-lg font-semibold text-gray-900 break-words">
        {safeValue}
      </p>
    </div>
  );
}

export function ViewQuestionModal({
  isOpen,
  onClose,
  questionId,
}: ViewQuestionModalProps) {
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !questionId) return;

    const controller = new AbortController();

    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuestion(null);

        const response = await api.get<{ data: QuestionDetail }>(
          `/questions/${encodeURIComponent(questionId)}`,
          { signal: controller.signal },
        );

        setQuestion(
          response.data.data ?? (response.data as unknown as QuestionDetail),
        );
      } catch (err: unknown) {
        const e = err as {
          name?: string;
          response?: { data?: { message?: string } };
        };
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setError(
          e?.response?.data?.message ?? "No se pudo cargar la pregunta.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchQuestion();

    return () => controller.abort();
  }, [isOpen, questionId]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000ab] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-[var(--pantone-7421)]">
            <h2 className="text-xl font-bold text-white">
              Detalle de la Pregunta
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            {loading && (
              <p className="text-center text-sm text-gray-400 py-6">
                Cargando información...
              </p>
            )}

            {error && !loading && (
              <p className="text-center text-sm text-red-600 py-6">{error}</p>
            )}

            {question && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <DetailRow
                    label="Nombre de la Pregunta:"
                    value={question.name}
                  />
                </div>
                <div className="col-span-2">
                  <DetailRow
                    label="Descripción:"
                    value={question.description}
                  />
                </div>
                <DetailRow
                  label="Fecha de creación:"
                  value={formatDate(question.created_at)}
                />
                <DetailRow
                  label="Fecha de desactivación:"
                  value={formatDate(question.deleted_at)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
