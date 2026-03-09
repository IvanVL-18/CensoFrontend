import { X } from "lucide-react";
import type { ViewSectionModalProps } from "../Sections.types";

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
  const safe = value?.trim() ? value : "N/A";

  return (
    <div className={isLongText ? "col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div
        className={`text-gray-900 ${
          isLongText
            ? "bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 whitespace-pre-wrap break-words"
            : "text-lg font-semibold whitespace-pre-wrap break-words"
        }`}
      >
        {safe}
      </div>
    </div>
  );
}

export function ViewSectionModal({
  isOpen,
  onClose,
  Section,
}: ViewSectionModalProps) {
  if (!isOpen || !Section) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header fijo */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white rounded-t-lg">
          <h2 className="text-xl font-bold">Detalle de la Sección</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailRow
              label="Nombre de la Sección:"
              value={Section.name}
              isLongText
            />
            <DetailRow
              label="Instrucciones:"
              value={Section.instructions}
              isLongText
            />
            <DetailRow
              label="Fecha de creación:"
              value={formatDate(Section.created_at)}
            />
            <DetailRow
              label="Fecha de desactivación:"
              value={formatDate(Section.deleted_at)}
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t">
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
}
