import { X } from "lucide-react";
import type { ViewSectionModalProps } from "../Sections.types";

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

export function ViewSectionModal({ isOpen, onClose, section }: ViewSectionModalProps) {
  if (!isOpen || !section) {
    return null;
  }

  return (
    <>
      {/* 1. Fondo Difuminado (Blur) */}
      <div 
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* 2. Contenedor del Modal */}
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        {/* Agregamos 'max-h-[90vh]' para evitar que se salga de pantalla si el texto es largo */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Cabecera */}
          <div className="flex justify-between items-center p-4 bg-red-900 shrink-0">
            <h2 className="text-xl font-bold text-white">Detalle de la sección</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo del Modal (Con scroll auto por si las instrucciones son muy largas) */}
          <div className="p-6 space-y-4 overflow-y-auto">
            <DetailRow 
              label="Nombre del módulo:" 
              value={section.name} 
            />

            {/* --- NUEVO CAMPO: Instrucciones --- */}
            {/* Usamos un diseño diferente al DetailRow para facilitar la lectura de textos largos */}
            <div>
               <label className="block text-sm font-medium text-gray-500 mb-1">
                 Instrucciones:
               </label>
               <div className="
                 text-sm text-gray-700 
                 bg-gray-50 p-3 rounded-md border border-gray-200
                 whitespace-pre-wrap  /* Respeta los saltos de línea */
                 max-h-60 overflow-y-auto /* Scroll interno si es muy largo */
               ">
                 {section.instructions || "Sin instrucciones detalladas."}
               </div>
            </div>

            <DetailRow 
              label="Fecha de creación:" 
              value={formatDate(section.created_at)} 
            />
            <DetailRow 
              label="Fecha de desactivación:" 
              value={formatDate(section.deleted_at)} 
            />
          </div>

          {/* Pie de página */}
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 shrink-0">
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