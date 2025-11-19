import { X } from "lucide-react";

type UiModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  maxWidth?: string;
};

export default function UiModal({ 
    open, 
    title, 
    onClose, 
    footer, 
    children, 
    hideCloseButton = false,
    maxWidth = 'max-w-lg' // Aumento ligeramente el ancho predeterminado para la elegancia
}: UiModalProps) {
  if (!open) return null;
  
  const modalWidthClass = `relative z-[201] w-full ${maxWidth} rounded-xl bg-white shadow-2xl border border-gray-100 transform transition-all duration-300 ease-out scale-100 opacity-100`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Overlay que cierra el modal al hacer clic fuera */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out" onClick={onClose} />
      
      <div className={modalWidthClass}>
        
        {/* Encabezado sin la barra de vino */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          
          {!hideCloseButton && (
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Contenido principal */}
        <div className="px-6 py-5">
            {children}
        </div>

        {/* Footer sin la barra de vino */}
        {footer && ( // Renderizar footer solo si existe
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-end">
              {footer}
          </div>
        )}
      </div>
    </div>
  );
}