import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { validateSection } from "../../utils/validation"; // <--- Tu nueva validación
import { FormErrors } from "./FormErrors";

interface SectionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  // Datos iniciales ahora es un objeto opcional
  initialData?: { name: string; instructions: string | null }; 
  onClose: () => void;
  onSave: (data: { name: string; instructions: string | null }) => void;
}

export function SectionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData,
  onClose,
  onSave,
}: SectionModalProps) {
  
  // Estados para los inputs
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Al abrir, reseteamos o cargamos datos
  useEffect(() => {
    if (isOpen) {
      const initialName = initialData?.name || "";
      const initialInst = initialData?.instructions || "";
      
      setName(initialName);
      setInstructions(initialInst);

      // Validamos estado inicial (por si queremos bloquear el botón de inicio)
      setFormErrors(validateSection({ name: initialName, instructions: initialInst }));
    }
  }, [isOpen, initialData]);

  // Manejador genérico de validación
  const validateState = (newName: string, newInst: string) => {
    const errors = validateSection({ name: newName, instructions: newInst });
    setFormErrors(errors);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    validateState(val, instructions);
  };

  const handleInstructionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInstructions(val);
    validateState(name, val);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Última validación antes de enviar
    const errors = validateSection({ name, instructions });
    setFormErrors(errors);

    if (errors.length === 0) {
      // Enviamos ambos campos
      onSave({ name, instructions }); 
    }
  };

  if (!isOpen) return null;

  const hasClientErrors = formErrors.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000ab]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
              
              {/* Campo NOMBRE */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la sección:
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-[#DDC9A3] focus:outline-none"
                  placeholder="Ej. Dirección General"
                  disabled={isSubmitting}
                />
              </div>

              {/* Campo INSTRUCCIONES (Textarea) */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Instrucciones (Opcional):
                </label>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={handleInstructionsChange}
                  rows={4}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-[#DDC9A3] focus:outline-none resize-none"
                  placeholder="Escribe las instrucciones aquí..."
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {instructions.length}/2200
                </p>
              </div>

              {/* Errores */}
              <FormErrors errors={formErrors} />
              {error && <FormErrors errors={[error]} />}

            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || hasClientErrors}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
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