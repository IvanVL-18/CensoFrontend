import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Props específicas de este modal
  title: string;
  message: string; 
  confirmButtonText?: string; 
  confirmButtonColor?: 'danger' | 'primary'; 
  // Funciones de control
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  isSubmitting,
  error,
  title,
  message,
  confirmButtonText = "Confirmar",
  confirmButtonColor = "danger",
  onClose,
  onConfirm,
}: ConfirmModalProps) {

  if (!isOpen) {
    return null;
  }

  // Define el estilo del botón de confirmación
  const confirmButtonClasses = {
    danger: "bg-red-900 text-white hover:bg-red-800",
    primary: "bg-white border border-[#691b31] text-[#691b31] hover:bg-gray-100",
  };

  return (
    <>
      
      <div 
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}>
      </div>

      
      <div className="fixed inset-0 bg-[#000000ab]  z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          
          
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          
          <div className="p-6">
            <p className="text-gray-700">{message}</p>

         
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </div>

        
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
            {/* Botón Cancelar */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                bg-[#C3A67C] text-white font-bold 
                py-2 px-6 rounded-lg 
                hover:brightness-95 
                disabled:opacity-50
              "
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`
                font-bold py-2 px-6 rounded-lg 
                disabled:opacity-50
                ${confirmButtonClasses[confirmButtonColor]}
              `}
            >
              {isSubmitting ? "Procesando..." : confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}