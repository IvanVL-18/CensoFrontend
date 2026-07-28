import { Loader2, X } from "lucide-react";
import type { QuestionDetail } from "../Censos.types";

interface QuestionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  detail: QuestionDetail | null;
  fallbackName?: string;
}

export function QuestionDetailModal({
  isOpen,
  onClose,
  loading,
  error,
  detail,
  fallbackName,
}: QuestionDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-[#5b1d27] shrink-0">
          <h2 className="text-sm font-bold text-white truncate pr-2">
            {detail?.name ?? fallbackName ?? "Detalle de la pregunta"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 text-sm">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              Cargando pregunta...
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-red-600 py-6">{error}</p>
          )}

          {!loading && !error && detail && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Nombre
                </p>
                <p className="text-gray-800">{detail.name}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Instrucciones
                </p>
                <p className="text-gray-800">
                  {detail.instructions || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Comentarios habilitados
                </p>
                <p className="text-gray-800">
                  {detail.commentaries ? "Sí" : "No"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Creada
                  </p>
                  <p className="text-gray-800">{detail.created_at ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Actualizada
                  </p>
                  <p className="text-gray-800">{detail.updated_at ?? "—"}</p>
                </div>
              </div>

              {detail.question_structure != null && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Estructura
                  </p>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
                    {typeof detail.question_structure === "string"
                      ? detail.question_structure
                      : JSON.stringify(detail.question_structure, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
