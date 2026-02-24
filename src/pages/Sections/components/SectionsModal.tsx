import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { SectionModalProps } from "../Sections.types";
import { Sectionschema } from "../schemas/Sections.schema";

export function SectionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData,
  onClose,
  onSave,
}: SectionModalProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setInstructions(initialData?.instructions || "");
      setFormErrors([]);
      setServerError(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (error) {
      setServerError(error);
    } else {
      setServerError(null);
    }
  }, [error]);

  const validateForm = (currentName: string, currentInstructions: string) => {
    const result = Sectionschema.safeParse({
      name: currentName,
      instructions: currentInstructions,
    });
    if (!result.success) {
      const errorMessages = result.error.issues.map((err) => err.message);
      setFormErrors(errorMessages);
      return false;
    } else {
      setFormErrors([]);
      return true;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isValid = validateForm(name, instructions);
    if (isValid) {
      onSave({ name, instructions });
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (formErrors.length > 0) validateForm(newName, instructions);
    if (serverError) setServerError(null);
  };

  const handleInstructionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newInstructions = e.target.value;
    setInstructions(newInstructions);
    if (formErrors.length > 0) validateForm(name, newInstructions);
    if (serverError) setServerError(null);
  };

  if (!isOpen) {
    return null;
  }

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!serverError;
  const hasChanges =
    name !== (initialData?.name || "") ||
    instructions !== (initialData?.instructions || "");

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
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6">
              <label htmlFor="SectionName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sección:
              </label>
              <input
                type="text"
                id="SectionName"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
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

              <label htmlFor="SectionInstructions" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                Instrucciones (Opcional):
              </label>
              <textarea
                id="SectionInstructions"
                value={instructions}
                onChange={handleInstructionsChange}
                placeholder="Escribe las instrucciones aquí..."
                rows={4}
                className={`
                  border rounded-lg p-2 w-full focus:outline-none focus:ring-2
                  ${(hasClientErrors || hasServerError)
                    ? 'border-red-500 focus:ring-red-400' 
                    : 'border-gray-300 focus:ring-[#DDC9A3]'
                  }
                `}
                disabled={isSubmitting}
              />

              <div id="form-errors-client">
                <FormErrors errors={formErrors} />
              </div>

              {serverError && (
                 <div id="form-errors-server">
                   <FormErrors errors={[serverError]} />
                 </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
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
                disabled={isSubmitting || hasClientErrors || !hasChanges}
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