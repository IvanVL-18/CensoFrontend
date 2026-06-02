import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { Catalogschema } from "../schemas/Catalogs.schema";
import type { CatalogModalProps } from "../Catalogs.types";
import { CharCountInput } from "../../../components/CharCountInput";

const NAME_MAX_LENGTH = 125;
const SLUG_MAX_LENGTH = 50;

export function CatalogModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  initialSlug = "",
  initialModuleId = "",
  initialModuleName = "",
  Modules,
  onClose,
  onSave,
}: CatalogModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ModuleId, setModuleId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    slug?: string;
    Module?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [nameCharCount, setNameCharCount] = useState(0);
  const [slugCharCount, setSlugCharCount] = useState(0);

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    slug: false,
    module: false,
  });

  const allErrorMessages = Object.values(fieldErrors).filter(
    Boolean,
  ) as string[];

  const visibleErrors = Object.entries(fieldErrors)
    .filter(([key]) => touchedFields[key as keyof typeof touchedFields])
    .map(([, value]) => value)
    .filter(Boolean) as string[];

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (!isOpen) return;

    const normalizedModuleId = initialModuleId
      ? String(initialModuleId).trim()
      : "";
    const normalizedModuleName = initialModuleName?.trim().toLowerCase() || "";
    let finalModuleId = normalizedModuleId;

    const ModuleById = Modules.find(
      (u) => String(u.id).trim() === normalizedModuleId,
    );
    if (ModuleById) {
      finalModuleId = ModuleById.id;
    } else if (normalizedModuleName && Modules.length) {
      const ModuleByName = Modules.find(
        (u) => u.name.trim().toLowerCase() === normalizedModuleName,
      );
      if (ModuleByName) finalModuleId = ModuleByName.id;
    }

    setName(initialName);
    setSlug(initialSlug);
    setModuleId(finalModuleId);
    setNameCharCount(initialName.length);
    setSlugCharCount(initialSlug.length);

    setFieldErrors({});
    setServerError(null);
    setTouchedFields({
      name: initialName !== "",
      slug: initialSlug !== "",
      module: finalModuleId !== "",
    });
  }, [
    isOpen,
    initialName,
    initialSlug,
    initialModuleId,
    initialModuleName,
    Modules,
  ]);

  const validateForm = (
    currentName: string,
    currentSlug: string,
    currentModuleId: string,
  ) => {
    const result = Catalogschema.safeParse({
      name: currentName,
      slug: currentSlug,
    });
    const errors: { name?: string; slug?: string; Module?: string } = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "name" | "slug";
        errors[field] = issue.message;
      });
    }

    if (!currentModuleId) {
      errors.Module = "Debe seleccionar una Modulo";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouchedFields({ name: true, slug: true, module: true });
    if (validateForm(name, slug, ModuleId)) {
      onSave(name, slug, ModuleId);
    }
  };

  const handleModuleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newModuleId = e.target.value;
    setModuleId(newModuleId);
    setTouchedFields((prev) => ({ ...prev, module: true }));
    validateForm(name, slug, newModuleId);
    setServerError(null);
  };

  const handleClose = () => {
    setName("");
    setSlug("");
    setModuleId("");
    setFieldErrors({});
    setServerError(null);
    setNameCharCount(0);
    setSlugCharCount(0);
    setTouchedFields({ name: false, slug: false, module: false });
    onClose();
  };

  if (!isOpen) return null;

  const hasNameError = touchedFields.name && !!fieldErrors.name;
  const hasSlugError = touchedFields.slug && !!fieldErrors.slug;
  const hasModuleError = touchedFields.module && !!fieldErrors.Module;

  const ModuleBorderColor = hasModuleError
    ? "border-red-500 focus:ring-red-400"
    : "border-gray-300 focus:ring-[#DDC9A3]";

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-[9999] transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 bg-[#000000ab] z-[10000] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
              <CharCountInput
                id="catalogName"
                label="Nombre del catálogo:"
                value={name}
                maxLength={NAME_MAX_LENGTH}
                placeholder="Ingresar nombre..."
                disabled={isSubmitting}
                hasError={hasNameError}
                autoFocus
                onChange={(val) => {
                  setName(val);
                  setNameCharCount(val.length);
                  setTouchedFields((prev) => ({ ...prev, name: true }));
                  validateForm(val, slug, ModuleId);
                  setServerError(null);
                }}
              />

              <CharCountInput
                id="catalogSlug"
                label="Slug:"
                value={slug}
                maxLength={SLUG_MAX_LENGTH}
                placeholder="Ingresar slug..."
                disabled={isSubmitting}
                hasError={hasSlugError}
                onChange={(val) => {
                  setSlug(val);
                  setSlugCharCount(val.length);
                  setTouchedFields((prev) => ({ ...prev, slug: true }));
                  validateForm(name, val, ModuleId);
                  setServerError(null);
                }}
              />

              <div>
                <label
                  htmlFor="ModuleId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Módulo:
                </label>
                <select
                  id="ModuleId"
                  value={ModuleId}
                  onChange={handleModuleChange}
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${ModuleBorderColor}`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar un módulo</option>
                  {Modules.map((Module) => (
                    <option key={Module.id} value={Module.id}>
                      {Module.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormErrors errors={visibleErrors} />
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
                disabled={isSubmitting || allErrorMessages.length > 0 || name.trim() === initialName.trim()}
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
