import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { CatalogItemModalProps } from "../CatalogItems.types";
import { CatalogItemSchema } from "../schemas/CatalogItem.schema";

const VALUE_MAX_LENGTH = 10;
const LABEL_MAX_LENGTH = 165;

export function CatalogItemModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialValue = "",
  initialLabel = "",
  initialCatalogId = "",
  catalogs,
  onClose,
  onSave,
  onClearServerError,
}: CatalogItemModalProps) {
  const [value, setValue] = useState(initialValue);
  const [label, setLabel] = useState(initialLabel);
  const [catalogId, setCatalogId] = useState(initialCatalogId);

  const [fieldErrors, setFieldErrors] = useState<{
    value?: string;
    label?: string;
    catalog_id?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [valueCharCount, setValueCharCount] = useState(initialValue.length);
  const [labelCharCount, setLabelCharCount] = useState(initialLabel.length);

  const [touchedFields, setTouchedFields] = useState({
    value: false,
    label: false,
    catalog_id: false,
  });

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (!isOpen) return;

    setValue(initialValue);
    setLabel(initialLabel);
    setCatalogId(initialCatalogId);
    setValueCharCount(initialValue.length);
    setLabelCharCount(initialLabel.length);
    setFieldErrors({});
    setServerError(null);
    setTouchedFields({
      value: initialValue !== "",
      label: initialLabel !== "",
      catalog_id: initialCatalogId !== "",
    });
    onClearServerError();
  }, [
    isOpen,
    initialValue,
    initialLabel,
    initialCatalogId,
    onClearServerError,
  ]);

  const validateForm = (
    currentValue: string,
    currentLabel: string,
    currentCatalogId: string,
  ) => {
    const result = CatalogItemSchema.safeParse({
      value: currentValue,
      label: currentLabel,
      catalog_id: currentCatalogId,
    });

    const errors: {
      value?: string;
      label?: string;
      catalog_id?: string;
    } = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "value" | "label" | "catalog_id";
        errors[field] = issue.message;
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouchedFields({ value: true, label: true, catalog_id: true });
    if (validateForm(value, label, catalogId)) {
      onSave(value, label, catalogId);
    }
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, VALUE_MAX_LENGTH);
    setValue(newValue);
    setValueCharCount(newValue.length);
    setTouchedFields((prev) => ({ ...prev, value: true }));
    validateForm(newValue, label, catalogId);
    setServerError(null);
    if (error) onClearServerError();
  };

  const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value.slice(0, LABEL_MAX_LENGTH);
    setLabel(newLabel);
    setLabelCharCount(newLabel.length);
    setTouchedFields((prev) => ({ ...prev, label: true }));
    validateForm(value, newLabel, catalogId);
    setServerError(null);
    if (error) onClearServerError();
  };

  const handleCatalogChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextCatalogId = e.target.value;
    setCatalogId(nextCatalogId);
    setTouchedFields((prev) => ({ ...prev, catalog_id: true }));
    validateForm(value, label, nextCatalogId);
    setServerError(null);
    if (error) onClearServerError();
  };

  const handleClose = () => {
    setValue("");
    setLabel("");
    setCatalogId("");
    setFieldErrors({});
    setServerError(null);
    setValueCharCount(0);
    setLabelCharCount(0);
    setTouchedFields({ value: false, label: false, catalog_id: false });
    onClearServerError();
    onClose();
  };

  if (!isOpen) return null;

  const hasValueError = touchedFields.value && !!fieldErrors.value;
  const hasLabelError = touchedFields.label && !!fieldErrors.label;
  const hasCatalogError = touchedFields.catalog_id && !!fieldErrors.catalog_id;

  const hasVisibleErrors = hasValueError || hasLabelError || hasCatalogError;
  const visibleErrors = [
    hasValueError ? fieldErrors.value : null,
    hasLabelError ? fieldErrors.label : null,
    hasCatalogError ? fieldErrors.catalog_id : null,
  ].filter(Boolean) as string[];

  const isUnchanged =
    value.trim() === initialValue.trim() &&
    label.trim() === initialLabel.trim() &&
    catalogId === initialCatalogId;

  const getInputBorderColor = (
    hasError: boolean,
    currentCharCount?: number,
    maxLength?: number,
  ) => {
    if (hasError) return "border-red-500 focus:ring-red-400";
    if (!currentCharCount || !maxLength) return "border-gray-300 focus:ring-[#DDC9A3]";
    if (currentCharCount >= maxLength) return "border-red-300 focus:ring-red-400";
    if (currentCharCount >= maxLength - 10) return "border-amber-300 focus:ring-amber-400";
    return "border-gray-300 focus:ring-[#DDC9A3]";
  };

  const getProgressBarColor = (currentCharCount: number, maxLength: number) => {
    if (currentCharCount >= maxLength) return "bg-red-600";
    if (currentCharCount >= maxLength - 10) return "bg-amber-500";
    return "bg-[#DDC9A3]";
  };

  const getCharCountColor = (currentCharCount: number, maxLength: number) => {
    if (currentCharCount >= maxLength) return "text-red-600";
    if (currentCharCount >= maxLength - 10) return "text-amber-600";
    return "text-gray-500";
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
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="itemValue" className="block text-sm font-medium text-gray-700">
                    Valor:
                  </label>
                  <span
                    className={`text-xs font-medium ${getCharCountColor(valueCharCount, VALUE_MAX_LENGTH)}`}
                  >
                    {valueCharCount}/{VALUE_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="itemValue"
                  value={value}
                  onChange={handleValueChange}
                  placeholder="Ingresar valor..."
                  maxLength={VALUE_MAX_LENGTH}
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(hasValueError, valueCharCount, VALUE_MAX_LENGTH)}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressBarColor(valueCharCount, VALUE_MAX_LENGTH)}`}
                    style={{ width: `${(valueCharCount / VALUE_MAX_LENGTH) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="itemLabel" className="block text-sm font-medium text-gray-700">
                    Etiqueta:
                  </label>
                  <span
                    className={`text-xs font-medium ${getCharCountColor(labelCharCount, LABEL_MAX_LENGTH)}`}
                  >
                    {labelCharCount}/{LABEL_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="itemLabel"
                  value={label}
                  onChange={handleLabelChange}
                  placeholder="Ingresar etiqueta..."
                  maxLength={LABEL_MAX_LENGTH}
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(hasLabelError, labelCharCount, LABEL_MAX_LENGTH)}`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressBarColor(labelCharCount, LABEL_MAX_LENGTH)}`}
                    style={{ width: `${(labelCharCount / LABEL_MAX_LENGTH) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="itemCatalog" className="block text-sm font-medium text-gray-700 mb-2">
                  Catalogo:
                </label>
                <select
                  id="itemCatalog"
                  value={catalogId}
                  onChange={handleCatalogChange}
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(hasCatalogError)}`}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar un catalogo</option>
                  {catalogs.map((catalog) => (
                    <option key={catalog.id} value={catalog.id}>
                      {catalog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div id="form-errors-client">
                <FormErrors errors={visibleErrors} />
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
                disabled={
                  isSubmitting ||
                  hasVisibleErrors ||
                  (value.trim() === "" && label.trim() === "" && catalogId === "") ||
                  isUnchanged
                }
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
