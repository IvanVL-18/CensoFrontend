// src/pages/area/AreasModal.tsx
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X, ChevronDown } from "lucide-react";
import { validateArea } from "../../utils/validation.area";
import { FormErrors } from "./FormErrors";

interface AreaModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  initialInstitutionId?: string;
  institutions: { id: string; name: string }[];
  onClose: () => void;
  onSave: (name: string, institution_id: string) => void;
}

export function AreaModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  initialInstitutionId = "",
  institutions,
  onClose,
  onSave,
}: AreaModalProps) {
  const [name, setName] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [institutionFieldTouched, setInstitutionFieldTouched] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setSelectedInstitution(initialInstitutionId || "");
      setInstitutionFieldTouched(false);
      setFormErrors([]);
    }
  }, [isOpen, initialName, initialInstitutionId, institutions]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setInstitutionFieldTouched(true);

    const validationErrors = validateArea({
      name,
      institution_id: selectedInstitution,
    });

    setFormErrors(validationErrors);

    if (validationErrors.length === 0) {
      onSave(name, selectedInstitution || "");
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    const validationErrors = validateArea({
      name: newName,
      institution_id: selectedInstitution,
    });

    if (institutionFieldTouched) {
      setFormErrors(validationErrors);
    } else {
      const nameErrors = validationErrors.filter(
        (err) => err !== "Debe seleccionar una institución."
      );
      setFormErrors(nameErrors);
    }
  };

  const handleInstitutionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newInstitutionId = e.target.value;
    setSelectedInstitution(newInstitutionId);

    if (!institutionFieldTouched) {
      setInstitutionFieldTouched(true);
    }

    const validationErrors = validateArea({
      name,
      institution_id: newInstitutionId,
    });
    setFormErrors(validationErrors);
  };

  if (!isOpen) return null;

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!error;
  const hasAnyError = hasClientErrors || hasServerError;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6">
              <label
                htmlFor="areaName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Área:
              </label>

              <input
                type="text"
                id="areaName"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
                className={`
                  w-full rounded-lg border bg-white px-3 py-2
                  text-gray-900 placeholder:text-gray-400
                  shadow-sm
                  focus:outline-none focus:ring-2
                  ${hasAnyError ? "border-red-500 focus:ring-red-400/60" : "border-gray-300 focus:ring-[#DDC9A3]/60"}
                  ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}
                `}
                disabled={isSubmitting}
                autoFocus
                aria-invalid={hasAnyError}
              />

              <label
                htmlFor="institution_id"
                className="block text-sm font-medium text-gray-700 mb-2 mt-4"
              >
                Institución:
              </label>

              {/* ✅ Selector mejorado */}
              <div className="relative">
                <select
                  id="institution_id"
                  value={selectedInstitution}
                  onChange={handleInstitutionChange}
                  disabled={isSubmitting}
                  className={`
                    w-full appearance-none rounded-lg border bg-white
                    px-3 py-2 pr-10
                    text-gray-900
                    shadow-sm
                    focus:outline-none focus:ring-2
                    ${hasAnyError ? "border-red-500 focus:ring-red-400/60" : "border-gray-300 focus:ring-[#DDC9A3]/60"}
                    ${isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:border-gray-400"}
                  `}
                >
                  <option value="">Seleccionar institución</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>

                {/* Icono flecha */}
                <ChevronDown
                  size={18}
                  className={`
                    pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
                    ${isSubmitting ? "text-gray-300" : "text-gray-500"}
                  `}
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
