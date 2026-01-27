// src/pages/area/ViewAreaModal.tsx
import { X } from "lucide-react";
import type { Area } from "./Areas.interfaces";

interface ViewAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: Area | null;
}

/**
 * helper para formatear las fechas de Laravel a un formato legible
 */
const formatDate = (dateString: string | null | undefined) => {
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
  value?: string | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="text-lg text-gray-900 font-semibold">{value || "N/A"}</p>
    </div>
  );
}

export default function ViewAreaModal({
  isOpen,
  onClose,
  area,
}: ViewAreaModalProps) {
  if (!isOpen || !area) return null;

  return (
    <>
      {/* Fondo (click para cerrar) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-[#691b31]">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Detalle del Área
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-white/90 hover:text-white"
              aria-label="Cerrar modal"
              title="Cerrar"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <DetailRow label="Nombre del Área:" value={area.name} />

            <DetailRow
              label="Institución:"
              value={area.institution?.name ?? "Sin institución"}
            />

            <DetailRow
              label="Fecha de creación:"
              value={formatDate((area as any).created_at)}
            />

            <DetailRow
              label="Fecha de desactivación:"
              value={formatDate(area.deleted_at)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="
                bg-[#C3A67C] text-white font-bold
                py-2 px-6 rounded-lg
                hover:brightness-95 active:brightness-90
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
