import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { Catalogschema } from "../schemas/Catalogs.schema"; // Ajusta la ruta según tu proyecto
import type { CatalogModalProps } from "../Catalogs.types";

const NAME_MAX_LENGTH = 125;
const SLUG_MAX_LENGTH = 50;

export function CatalogModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  initialSlug = "",
  initialUnitId = "",
  initialUnitName = "",
  units,
  onClose,
  onSave,
}: CatalogModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [unitId, setUnitId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; slug?: string; unit?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [nameCharCount, setNameCharCount] = useState(0);
  const [slugCharCount, setSlugCharCount] = useState(0);

  const errorMessages = Object.values(fieldErrors).filter(Boolean) as string[];

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      const normalizedUnitId = initialUnitId ? String(initialUnitId).trim() : "";
      const normalizedUnitName = initialUnitName?.trim().toLowerCase() || "";
      let finalUnitId = normalizedUnitId;

      const unitById = units.find(u => String(u.id).trim() === normalizedUnitId);
      if (unitById) {
        finalUnitId = unitById.id;
      } else if (normalizedUnitName && units.length > 0) {
        const unitByName = units.find(u => u.name.trim().toLowerCase() === normalizedUnitName);
        if (unitByName) {
          finalUnitId = unitByName.id;
        }
      }

      setName(initialName);
      setSlug(initialSlug);
      setUnitId(finalUnitId);
      setNameCharCount(initialName.length);
      setSlugCharCount(initialSlug.length);
      setFieldErrors({});
      setServerError(null);
    }
  }, [isOpen, initialName, initialSlug, initialUnitId, initialUnitName, units]);

  // Validación basada en el esquema Zod (sin lógica manual para name/slug)
  const validateForm = (currentName: string, currentSlug: string, currentUnitId: string) => {
    // 1. Validar name y slug con Zod
    const result = Catalogschema.safeParse({ name: currentName, slug: currentSlug });
    
    const errors: { name?: string; slug?: string; unit?: string } = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'name' | 'slug';
        errors[field] = issue.message;
      });
    }

    // 2. Validar unitId manualmente (opcional, si no está en el esquema)
    if (!currentUnitId) {
      errors.unit = "Debe seleccionar una unidad";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm(name, slug, unitId)) {
      onSave(name, slug, unitId);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, NAME_MAX_LENGTH);
    setName(newName);
    setNameCharCount(newName.length);
    validateForm(newName, slug, unitId);
    setServerError(null);
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.slice(0, SLUG_MAX_LENGTH);
    setSlug(newSlug);
    setSlugCharCount(newSlug.length);
    validateForm(name, newSlug, unitId);
    setServerError(null);
  };

  const handleUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newUnitId = e.target.value;
    setUnitId(newUnitId);
    validateForm(name, slug, newUnitId);
    setServerError(null);
  };

  const handleClose = () => {
    setName("");
    setSlug("");
    setUnitId("");
    setFieldErrors({});
    setServerError(null);
    setNameCharCount(0);
    setSlugCharCount(0);
    onClose();
  };

  if (!isOpen) return null;

  // Utilidades para estilos dinámicos (igual que en CategoryModal)
  const getFieldStyles = (value: string, maxLength: number, currentCharCount: number, hasFieldError: boolean) => {
    const isNearLimit = currentCharCount >= maxLength - 10 && currentCharCount <= maxLength;
    const isAtLimit = currentCharCount >= maxLength;

    const getBorderColor = () => {
      if (hasFieldError) return 'border-red-500 focus:ring-red-400';
      if (isAtLimit) return 'border-red-300 focus:ring-red-400';
      if (isNearLimit) return 'border-amber-300 focus:ring-amber-400';
      return 'border-gray-300 focus:ring-[#DDC9A3]';
    };

    const getProgressColor = () => {
      if (isAtLimit) return 'bg-red-600';
      if (isNearLimit) return 'bg-amber-500';
      return 'bg-[#DDC9A3]';
    };

    const getCharCountColor = () => {
      if (isAtLimit) return 'text-red-600';
      if (isNearLimit) return 'text-amber-600';
      return 'text-gray-500';
    };

    return {
      borderColor: getBorderColor(),
      progressColor: getProgressColor(),
      charCountColor: getCharCountColor(),
    };
  };

  const hasNameError = !!fieldErrors.name;
  const hasSlugError = !!fieldErrors.slug;
  const hasUnitError = !!fieldErrors.unit;

  const nameStyles = getFieldStyles(name, NAME_MAX_LENGTH, nameCharCount, hasNameError);
  const slugStyles = getFieldStyles(slug, SLUG_MAX_LENGTH, slugCharCount, hasSlugError);

  const unitBorderColor = hasUnitError
    ? 'border-red-500 focus:ring-red-400'
    : 'border-gray-300 focus:ring-[#DDC9A3]';

  return (
    <>
      <div
        className="fixed inset-0 bg-[#000000ab] z-40 transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
              {/* Campo Nombre */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="catalogName" className="block text-sm font-medium text-gray-700">
                    Nombre del catálogo:
                  </label>
                  <span className={`text-xs font-medium ${nameStyles.charCountColor}`}>
                    {nameCharCount}/{NAME_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="catalogName"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Ingresar nombre..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${nameStyles.borderColor}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${nameStyles.progressColor}`}
                    style={{ width: `${(nameCharCount / NAME_MAX_LENGTH) * 100}%` }}
                  />
                </div>
              </div>

              {/* Campo Slug */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="catalogSlug" className="block text-sm font-medium text-gray-700">
                    Slug:
                  </label>
                  <span className={`text-xs font-medium ${slugStyles.charCountColor}`}>
                    {slugCharCount}/{SLUG_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="catalogSlug"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="Ingresar slug..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${slugStyles.borderColor}`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${slugStyles.progressColor}`}
                    style={{ width: `${(slugCharCount / SLUG_MAX_LENGTH) * 100}%` }}
                  />
                </div>
              </div>

              {/* Campo Unidad */}
              <div>
                <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad:
                </label>
                <select
                  id="unitId"
                  value={unitId}
                  onChange={handleUnitChange}
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${unitBorderColor}`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar una unidad</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar errores de validación y de servidor */}
              <FormErrors errors={errorMessages} />
              {serverError && <FormErrors errors={[serverError]} />}
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
                disabled={isSubmitting || errorMessages.length > 0}
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