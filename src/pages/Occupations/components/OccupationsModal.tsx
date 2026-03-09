import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { OccupationModalProps } from "../Occupations.types";
import { Occupationschema } from "../schemas/Occupations.schema";

const MAX_LENGTH = 45;

export function OccupationModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  onClose,
  onSave,
}: OccupationModalProps) {
  const [name, setName] = useState(initialName);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(initialName.length);

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setFormErrors([]);
      setServerError(null);
      setCharCount(initialName.length);
    }
  }, [isOpen, initialName]);

  const validateForm = (currentName: string) => {
    const result = Occupationschema.safeParse({ name: currentName });
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
    const isValid = validateForm(name);
    if (isValid) {
      onSave(name);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName.length <= MAX_LENGTH) {
      setName(newName);
      setCharCount(newName.length);
      validateForm(newName);
      setServerError(null);
    }
  };

  const handleClose = () => {
    setName("");
    setFormErrors([]);
    setServerError(null);
    setCharCount(0);
    onClose();
  };

  if (!isOpen) return null;

  const hasErrors = formErrors.length > 0 || !!serverError;
  const isNearLimit = charCount >= MAX_LENGTH - 10 && charCount <= MAX_LENGTH;
  const isAtLimit = charCount >= MAX_LENGTH;

  const getInputBorderColor = () => {
    if (hasErrors) return 'border-red-500 focus:ring-red-400';
    if (isAtLimit) return 'border-red-300 focus:ring-red-400';
    if (isNearLimit) return 'border-amber-300 focus:ring-amber-400';
    return 'border-gray-300 focus:ring-[#DDC9A3]';
  };

  const getProgressBarColor = () => {
    if (isAtLimit) return 'bg-red-600';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-[#DDC9A3]';
  };

  const getCharCountColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-gray-500';
  };

  const isUnchanged = name === initialName;

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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="OccupationName" className="block text-sm font-medium text-gray-700">
                  Nombre de la ocupación:
                </label>
                <span className={`text-xs font-medium ${getCharCountColor()}`}>
                  {charCount}/{MAX_LENGTH} caracteres
                </span>
              </div>

              <input
                type="text"
                id="OccupationName"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
                maxLength={MAX_LENGTH}
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor()}`}
                disabled={isSubmitting}
                autoFocus
              />

              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${(charCount / MAX_LENGTH) * 100}%` }}
                />
              </div>

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
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formErrors.length > 0 || isUnchanged}
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