import { X } from "lucide-react";
// Importa tu interfaz 'Section' desde donde la tengas
import type { Section } from "./Section.interfaces";

interface ViewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  Section: Section | null; // El módulo que vamos a mostrar
}

/**
 * helper para formatear las fechas de Laravel a un formato legible
 */
const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "N/A"; // No aplica (ej. si no ha sido desactivado)
  }
  try {
    // Convierte 'YYYY-MM-DDTHH:MM:SS.mmmmmmZ' a un formato local
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

/**
 * Componente de fila para mostrar un detalle
 */
function DetailRow({ label, value }: { label: string, value: string | null }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">
        {label}
      </label>
      <p className="text-lg text-gray-900 font-semibold">{value || "N/A"}</p>
    </div>
  );
}

export function ViewSectionModal({ isOpen, onClose, Section }: ViewSectionModalProps) {
  // Si no está abierto o no hay una unidad, no renderiza nada
  if (!isOpen || !Section) {
    return null;
  }

  return (
    <>
      {/* 1. Fondo Difuminado (Blur) */}
      <div 
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}>
      </div>

      {/* 2. Contenedor del Modal */}
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          
          {/* Cabecera del Modal (como los otros) */}
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">Detalle del Módulo</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo del Modal (Los 3 campos) */}
          <div className="p-6 space-y-4">
            <DetailRow 
              label="Nombre del módulo:" 
              value={Section.name} 
            />
            <DetailRow 
              label="Fecha de creación:" 
              value={formatDate(Section.created_at)} // Asumiendo que se llama así
            />
            <DetailRow 
              label="Fecha de desactivación:" 
              value={formatDate(Section.deleted_at)} // Asumiendo que se llama así
            />
          </div>

          {/* Pie de página del Modal (Solo 1 botón) */}
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