import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { SectionModalProps } from "../Sections.types"; // Asegúrate que la ruta sea correcta
import { sectionSchema, type SectionFormData } from "../schemas/Sections.schema";

export function SectionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  initialInstructions = "", 
  onClose,
  onSave,
}: SectionModalProps & { initialInstructions?: string }) {
  
  const [formData, setFormData] = useState<SectionFormData>({
    name: initialName,
    instructions: initialInstructions,
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialName,
        instructions: initialInstructions || "",
      });
      setFormErrors([]);
    }
  }, [isOpen, initialName, initialInstructions]);

  const validateForm = (data: SectionFormData) => {
    const result = sectionSchema.safeParse(data);
    
    if (!result.success) {
      const errorMessages = result.error.issues.map((err) => err.message);
      setFormErrors(errorMessages);
      return false;
    } else {
      setFormErrors([]);
      return true;
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Validamos en tiempo real
    validateForm(newData);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isValid = validateForm(formData);
    
    if (isValid) {
      onSave(formData); 
    }
  };

  if (!isOpen) return null;

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!error;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-red-900 shrink-0">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          {/* Body (Scrollable si es muy alto) */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto">
              
              {/* CAMPO: NOMBRE */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Sección:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name" // Importante para el handleChange
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Sección Demográfica..."
                  className={`
                    border rounded-lg p-2 w-full focus:outline-none focus:ring-2
                    ${(hasClientErrors || hasServerError)
                      ? 'border-red-500 focus:ring-red-400' 
                      : 'border-gray-300 focus:ring-[#DDC9A3]'
                    }
                  `}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* CAMPO: INSTRUCCIONES */}
              <div className="mb-4">
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones (Opcional):
                </label>
                <textarea
                  id="instructions"
                  name="instructions" // Importante para el handleChange
                  value={formData.instructions || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Escribe las instrucciones detalladas aquí..."
                  className={`
                    border rounded-lg p-2 w-full resize-none focus:outline-none focus:ring-2
                    ${hasClientErrors 
                      ? 'border-red-500 focus:ring-red-400' 
                      : 'border-gray-300 focus:ring-[#DDC9A3]'
                    }
                  `}
                  disabled={isSubmitting}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {(formData.instructions?.length || 0)} / 4200
                </div>
              </div>

              {/* ERRORES */}
              <div id="form-errors-client">
                <FormErrors errors={formErrors} />
              </div>

              {error && (
                 <div id="form-errors-server">
                   <FormErrors errors={[error]} />
                 </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
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