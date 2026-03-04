import { X,Eye } from "lucide-react";
import type { ViewQuestionModalProps } from "../Questions.types";

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "N/A"; 
  }
  try {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return "Fecha inválida";
  }
};


function DetailRow({ label, value, isLongText = false }: { label: string, value: string | null | React.ReactNode, isLongText?: boolean }) {
  return (
    <div className={isLongText ? "col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      {/* Se añaden clases para que el texto largo se ajuste y no rompa el layout */}
      <div
        className={`text-gray-900 ${
          isLongText ? 'bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 whitespace-pre-wrap break-words' : 'text-lg font-semibold'
        }`}
      >
        {value || "N/A"}
      </div>
    </div>
  );
}

export const ViewQuestionModal = ({ isOpen, onClose, Question, onOpenPreview }: ViewQuestionModalProps & { onOpenPreview: () => void }) => {
  if (!isOpen || !Question) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white rounded-t-lg">
          <h2 className="text-xl font-bold">Detalles de la Pregunta</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailRow label="Pregunta:" value={Question.name} isLongText={true} />
            <DetailRow label="Instrucciones:" value={Question.instructions || "Sin instrucciones."} isLongText={true} />
            <DetailRow label="Fecha de creación:" value={formatDate(Question.created_at)} />
          </div>
        </div>

        {/* Footer con el nuevo botón */}
        <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t">
          {/* BOTÓN DE PREVIEW FORM.IO */}
          <button
            onClick={onOpenPreview}
            className="flex items-center gap-2 bg-red-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-900 transition-colors"
          >
            <Eye size={18} />
            Ver Componente
          </button>

          <button
            onClick={onClose}
            className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};