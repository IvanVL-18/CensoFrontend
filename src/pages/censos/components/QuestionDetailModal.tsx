import { useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { Form } from "@formio/react";
import "../../../styles/bootstrap-scoped.css";
import { sanitizeSchema, disableAllFields } from "../../../lib/formioSchema";
import type { QuestionDetail } from "../Censos.types";

const FormAny = Form as any;

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
  const { schema, schemaError } = useMemo(() => {
    if (detail?.question_structure == null) {
      return { schema: null, schemaError: null as string | null };
    }

    try {
      let parsed =
        typeof detail.question_structure === "string"
          ? JSON.parse(detail.question_structure)
          : { ...(detail.question_structure as Record<string, any>) };

      parsed = sanitizeSchema(parsed);
      if (Array.isArray(parsed.components)) {
        parsed = {
          ...parsed,
          components: disableAllFields(parsed.components),
        };
      }
      parsed.display = "form";

      return { schema: parsed, schemaError: null };
    } catch {
      return {
        schema: null,
        schemaError: "No se pudo interpretar la estructura del formulario.",
      };
    }
  }, [detail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
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
                  Instrucciones
                </p>
                <p className="text-gray-800">{detail.instructions || "—"}</p>
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

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Vista previa del formulario
                </p>

                {schemaError && (
                  <p className="text-sm text-red-600">{schemaError}</p>
                )}

                {!schemaError && !schema && (
                  <p className="text-sm text-gray-400">
                    Esta pregunta no tiene una estructura de formulario
                    asignada.
                  </p>
                )}

                {!schemaError && schema && (
                  // .bs: Bootstrap scoped — Form.io necesita Bootstrap para
                  // renderizar sus campos correctamente sin filtrar estilos
                  // al resto del modal (que usa Tailwind).
                  <div className="bs">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 min-w-0">
                      <FormAny
                        form={schema}
                        options={{
                          readOnly: true,
                          noAlerts: true,
                          language: "es",
                          noDefaultSubmitButton: true,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
