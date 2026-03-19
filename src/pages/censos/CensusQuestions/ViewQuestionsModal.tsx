import { X, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../lib/Axios";
import { PreviewQuestionModal } from "./PreviewQuestionModal";
// Ajusta la ruta según donde tengas PreviewQuestionModal en tu proyecto

interface QuestionDetail {
  id: string;
  name: string;
  instructions: string | null;
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
  isLongText = false,
}: {
  label: string;
  value: string | null | undefined;
  isLongText?: boolean;
}) {
  const safeValue = value?.trim() ? value : "N/A";
  return (
    <div className={isLongText ? "col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      {isLongText ? (
        <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 whitespace-pre-wrap break-words text-gray-900">
          {safeValue}
        </div>
      ) : (
        <p className="text-lg font-semibold text-gray-900 break-words">
          {safeValue}
        </p>
      )}
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

  // Estado del PreviewQuestionModal (Form.io)
  const [previewOpen, setPreviewOpen] = useState(false);

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


  const handleClose = () => {
    setPreviewOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">

          
          <div className="flex justify-between items-center p-4 bg-[var(--pantone-7421)]">
            <h2 className="text-xl font-bold text-white">
              Detalle de la Pregunta
            </h2>
            <button
              onClick={handleClose}
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
                <DetailRow
                  label="Nombre de la Pregunta:"
                  value={question.name}
                  isLongText
                />
                <DetailRow
                  label="Instrucciones:"
                  value={question.instructions}
                  isLongText
                />
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

        
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t border-gray-100">
         
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={!question}
              className="flex items-center gap-2 bg-[var(--pantone-7421)] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={18} />
              Ver Componente
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      
      <PreviewQuestionModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        questionId={questionId}

      />
    </>
  );
}