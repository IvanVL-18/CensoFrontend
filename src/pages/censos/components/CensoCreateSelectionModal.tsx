// components/censos/CensoCreateSelectionModal.tsx
import { X, FileText, Upload } from "lucide-react";

interface CensoCreateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectTemplate: () => void;
}

export function CensoCreateSelectionModal({
  isOpen,
  onClose,
  onSelectManual,
  onSelectTemplate,
}: CensoCreateSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-[#000000ab] z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-[#691b31]">
            <h2 className="text-xl font-bold text-white">Nuevo censo</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo con opciones */}
          <div className="p-6 space-y-4">
            <p className="text-gray-600 text-center mb-4">
              ¿Cómo deseas crear el censo?
            </p>

            <button
              onClick={onSelectManual}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#691b31] hover:bg-gray-50 transition-colors group"
            >
              <div className="p-3 bg-[#691b31] rounded-full group-hover:scale-105 transition-transform">
                <FileText className="text-white" size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Crear manualmente</h3>
                <p className="text-sm text-gray-500">Completa el formulario con los datos del censo</p>
              </div>
            </button>

            <button
              onClick={onSelectTemplate}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#691b31] hover:bg-gray-50 transition-colors group"
            >
              <div className="p-3 bg-[#691b31] rounded-full group-hover:scale-105 transition-transform">
                <Upload className="text-white" size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Usar plantilla</h3>
                <p className="text-sm text-gray-500">Sube un archivo Excel con los datos precargados</p>
              </div>
            </button>
          </div>

          {/* Footer con botón cancelar */}
          <div className="flex justify-end p-4 bg-gray-50">
            <button
              onClick={onClose}
              className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}