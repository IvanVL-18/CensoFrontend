import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { UnitModalProps } from "../units.types";
import { unitSchema } from "../schemas/units.schema";

export function UnitModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  onClose,
  onSave,
  onClearServerError,
}: UnitModalProps) {
  const [name, setName] = useState(initialName);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(initialName.length);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setFormErrors([]);
      onClearServerError(); 
    }
  }, [isOpen, initialName, onClearServerError]);

  const validateForm = (currentName: string) => {
    const result = unitSchema.safeParse({ name: currentName });

    if (!result.success) {
      const errorMessages = result.error.issues.map((err) => err.message);
      setFormErrors(errorMessages);
      return false;
    }

    setFormErrors([]);
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isValid = validateForm(name);
    if (isValid) onSave(name);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    validateForm(newName);

    if (error) onClearServerError();
  };

  if (!isOpen) return null;

  const getCharCountColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-gray-500';
  };

  const handleClose = () => {
    onClearServerError();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6">
              <label
                htmlFor="unitName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del módulo:
              </label>

              <input
                type="text"
                id="unitName"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
                className={`
                  border rounded-lg p-2 w-full focus:outline-none focus:ring-2
                  ${(hasClientErrors || hasServerError)
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#DDC9A3]"
                  }
                `}
                disabled={isSubmitting}
                autoFocus
              />
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${(charCount / MAX_LENGTH) * 100}%` }}
                />
              </div>

              {error && (
                <div id="form-errors-server">
                  <FormErrors errors={[error]} />
                </div>
              )}
            </div>
            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || formErrors.length > 0}
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
