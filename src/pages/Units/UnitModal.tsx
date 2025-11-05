import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";

interface UnitModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;

  onClose: () => void;
  onSave: (name: string) => void;
}

export function UnitModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  onClose,
  onSave,
}: UnitModalProps) {
  const [name, setName] = useState(initialName);

  // Este useEffect ahora sincroniza el estado 'name' con
  // el 'initialName' CADA VEZ que el modal se abre.
  useEffect(() => {
    if (isOpen) {
      // <--- CAMBIO 3 (Usamos initialName para resetear)
      setName(initialName);
    }
  }, [isOpen, initialName]); // Dependemos de ambos

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 1. Fondo Difuminado (Blur) */}
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* 2. Contenedor del Modal */}
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          {/* Cabecera del Modal */}
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

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Input */}
              <label
                htmlFor="unitName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del modulo:
              </label>
              <input
                type="text"
                id="unitName"
                value={name} // Esto ya estaba bien
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresar nombre..."
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                disabled={isSubmitting}
                autoFocus
              />

              {/* Mensaje de Error (si existe) */}
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            {/* Pie de página del Modal (Botones) */}
            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
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
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="
                  bg-white border border-[#691b31] text-[#691b31] font-bold 
                  py-2 px-6 rounded-lg 
                  hover:bg-gray-100 
                  disabled:opacity-50
                "
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
