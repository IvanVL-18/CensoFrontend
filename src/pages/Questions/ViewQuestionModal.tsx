import { X } from "lucide-react";
import type { ViewQuestionModalProps } from "./questions.interfaces";

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="text-lg text-gray-900 font-semibold">{value}</p>
    </div>
  );
}

export function ViewQuestionModal({ isOpen, onClose, question }: ViewQuestionModalProps) {
  if (!isOpen || !question) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">Detalle de la pregunta</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <DetailRow label="Pregunta:" value={question.name} />
            <DetailRow label="Tipo:" value={question.type} />
            <DetailRow
              label="Comentarios habilitados:"
              value={question.commentaries ? "Sí" : "No"}
            />
            <DetailRow
              label="Instrucciones:"
              value={question.instructions ?? "N/A"}
            />
            <DetailRow
              label="Fecha de creación:"
              value={formatDate(question.created_at)}
            />
            <DetailRow
              label="Fecha de desactivación:"
              value={formatDate(question.deleted_at)}
            />

            {question.type !== "empty" && (
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Opciones:
                </label>
                <ul className="mt-2 list-disc pl-6 text-gray-800">
                  {(question.options ?? []).length === 0 ? (
                    <li className="text-gray-500">Sin opciones</li>
                  ) : (
                    question.options!.map((o, idx) => <li key={idx}>{o.name}</li>)
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="
                bg-[#C3A67C] text-white font-bold 
                py-2 px-6 rounded-lg 
                hover:brightness-95
              "
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
