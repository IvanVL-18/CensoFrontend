import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { CategoryModalProps } from "../Categories.types";
import { Categorieschema } from "../schemas/Categories.schema"; 

// Obtener el máximo de caracteres del schema
const MAX_LENGTH = 65; // Ajusta este valor según tu schema

export function CategoryModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  onClose,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(initialName.length);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setFormErrors([]);
      setCharCount(initialName.length);
    }
  }, [isOpen, initialName]);
  
  const validateForm = (currentName: string) => {
    const result = Categorieschema.safeParse({ name: currentName });
    const errors: string[] = [];

    if (!result.success) {
      errors.push(...result.error.issues.map((err) => err.message));
    }

    // Validación para números (ajustar según requerimientos del backend)
    if (/\d/.test(currentName)) {
      errors.push("El nombre no puede contener números");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
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
    
    // Limitar la longitud máxima
    if (newName.length <= MAX_LENGTH) {
      setName(newName);
      setCharCount(newName.length);
      validateForm(newName);
    }
  };

  if (!isOpen) {
    return null;
  }

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!error;
  const isNearLimit = charCount >= MAX_LENGTH - 10 && charCount <= MAX_LENGTH;
  const isAtLimit = charCount >= MAX_LENGTH;

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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="CategoryName" className="block text-sm font-medium text-gray-700">
                  Nombre de la categoría:
                </label>
                <span 
                  className={`text-xs font-medium ${
                    isAtLimit 
                      ? 'text-red-600' 
                      : isNearLimit 
                        ? 'text-amber-600' 
                        : 'text-gray-500'
                  }`}
                >
                  {charCount}/{MAX_LENGTH} caracteres
                </span>
              </div>
              
              <input
                type="text"
                id="CategoryName"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
                maxLength={MAX_LENGTH}
                className={`
                  border rounded-lg p-2 w-full focus:outline-none focus:ring-2
                  ${(hasClientErrors || hasServerError)
                    ? 'border-red-500 focus:ring-red-400' 
                    : isAtLimit
                      ? 'border-red-300 focus:ring-red-400'
                      : isNearLimit
                        ? 'border-amber-300 focus:ring-amber-400'
                        : 'border-gray-300 focus:ring-[#DDC9A3]'
                  }
                `}
                disabled={isSubmitting}
                autoFocus
              />

              {/* Barra de progreso de caracteres */}
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isAtLimit 
                      ? 'bg-red-600' 
                      : isNearLimit 
                        ? 'bg-amber-500' 
                        : 'bg-[#DDC9A3]'
                  }`}
                  style={{ width: `${(charCount / MAX_LENGTH) * 100}%` }}
                />
              </div>

              <div id="form-errors-client">
                <FormErrors errors={formErrors} />
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