import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { validateRol } from "../../utils/validation.rol";
import { FormErrors } from "./FormErrors";

interface rolModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null; 
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function RolModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  onClose,
  onSave,
}: rolModalProps) {
  const [name, setName] = useState(initialName);
  
  // <--- CAMBIO 2: El estado de errores ahora es un array de strings
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      // Limpiamos los errores al abrir el modal
      setFormErrors([]);
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // <--- CAMBIO 4: Re-validamos antes de enviar
    const validationErrors = validateRol({ name });
    setFormErrors(validationErrors); // Muestra errores si los hay

    // Si el array de errores está vacío, podemos enviar
    if (validationErrors.length === 0) {
      onSave(name);
    }
  };

  // <--- CAMBIO 5: ¡La validación "tecla por tecla"!
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Validamos en CADA cambio y actualizamos el estado de errores
    const validationErrors = validateRol({ name: newName });
    setFormErrors(validationErrors);
  };

  if (!isOpen) {
    return null;
  }

  // <--- CAMBIO 6: Variable para saber si hay errores (cliente o servidor)
  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!error; // Convierte string|null a boolean

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
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

          <form onSubmit={handleSubmit} noValidate> {/* Añadido noValidate para prevenir validación HTML5 */}
            <div className="p-6">
              <label
                htmlFor="rolName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Rol:
              </label>
              <input
                type="text"
                id="rolName"
                value={name}
                // <--- CAMBIO 7: Usamos la nueva función de 'onChange'
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
                className={`
                  border rounded-lg p-2 w-full focus:outline-none focus:ring-2
                  ${/* <--- CAMBIO 8: Estilo condicional */ ''}
                  ${(hasClientErrors || hasServerError)
                    ? 'border-red-500 focus:ring-red-400' // Borde rojo si hay error
                    : 'border-gray-300 focus:ring-[#DDC9A3]'
                  }
                `}
                disabled={isSubmitting}
                autoFocus
                aria-invalid={hasClientErrors || hasServerError} // Para accesibilidad
                aria-describedby={hasClientErrors ? "form-errors-client" : (hasServerError ? "form-errors-server" : undefined)}
              />

              {/* <--- CAMBIO 9: Mostramos errores del CLIENTE */ ''}
              <div id="form-errors-client">
                <FormErrors errors={formErrors} />
              </div>

              {/* <--- CAMBIO 10: Mostramos error del SERVIDOR (ej: "unique") */ ''}
              {/* Lo mostramos en el mismo formato de alerta */}
              {error && (
                 <div id="form-errors-server">
                   <FormErrors errors={[error]} />
                 </div>
              )}
            </div>

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
                // <--- CAMBIO 11: Deshabilitamos si hay errores de CLIENTE
                disabled={isSubmitting || hasClientErrors}
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