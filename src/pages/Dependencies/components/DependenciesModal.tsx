import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { DependencyModalProps } from "../Dependencies.types";
import { Dependencieschema } from "../schemas/Dependencies.schema";
import { CharCountInput } from "../../../components/CharCountInput";

const MAX_LENGTH = 45;

export function DependencyModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  onClose,
  onSave,
  onClearServerError,
}: DependencyModalProps) {
  const [name, setName] = useState(initialName);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setFormErrors([]);
      setServerError(null);
      onClearServerError();
    }
  }, [isOpen, initialName, onClearServerError]);

  const validateForm = (currentName: string) => {
    const result = Dependencieschema.safeParse({ name: currentName });
    const errors: string[] = [];
    if (!result.success) {
      errors.push(...result.error.issues.map((err) => err.message));
    }
    if (/\d/.test(currentName)) {
      errors.push("El nombre no puede contener números");
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm(name)) onSave(name);
  };

  const handleClose = () => {
    setName("");
    setFormErrors([]);
    setServerError(null);
    onClearServerError();
    onClose();
  };

  if (!isOpen) return null;

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
              <CharCountInput
                id="DependencyName"
                label="Nombre de la dependencia:"
                value={name}
                maxLength={MAX_LENGTH}
                placeholder="Ingresar nombre..."
                disabled={isSubmitting}
                hasError={formErrors.length > 0}
                autoFocus
                onChange={(val) => {
                  setName(val);
                  validateForm(val);
                  setServerError(null);
                  if (error) onClearServerError();
                }}
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
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formErrors.length > 0 || name.trim() === initialName.trim()}
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
