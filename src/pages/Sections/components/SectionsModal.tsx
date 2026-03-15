import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { SectionModalProps } from "../Sections.types";
import { Sectionschema } from "../schemas/Sections.schema";

const NAME_MAX = 180;
const INSTRUCTIONS_MAX = 4200;

export function SectionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData,
  onClose,
  onSave,
  isViewOnly,
}: SectionModalProps & { isViewOnly?: boolean }) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [nameCharCount, setNameCharCount] = useState(0);
  const [instructionsCharCount, setInstructionsCharCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      console.log("initialData en modal:", initialData);
      setName(initialData?.name || "");
      setInstructions(initialData?.instructions || "");
      setNameCharCount(initialData?.name?.length || 0);
      setInstructionsCharCount(initialData?.instructions?.length || 0);
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
    if (!isValid) return;

    const isEditMode = !!initialData;

    const initialName = (initialData?.name ?? "").trim();
    const initialInstr = (initialData?.instructions ?? "").trim();

    const currentName = name.trim();
    const currentInstr = instructions.trim();
    if (isEditMode) {
      const patch: any = {};

      if (currentName !== initialName) patch.name = currentName;

      if (currentInstr !== initialInstr) {
        patch.instructions = currentInstr === "" ? null : currentInstr;
      }

      onSave(patch);
      return;
    }

    onSave({
      name: currentName,
      ...(currentInstr ? { instructions: currentInstr } : {}),
    });
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName.length <= NAME_MAX) {
      setName(newName);
      setNameCharCount(newName.length);
      validateForm(newName, instructions);
      if (serverError) setServerError(null);
    }
  };

  const handleInstructionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newInstructions = e.target.value;
    if (newInstructions.length <= INSTRUCTIONS_MAX) {
      setInstructions(newInstructions);
      setInstructionsCharCount(newInstructions.length);
      validateForm(name, newInstructions);
      if (serverError) setServerError(null);
    }
  };

  const handleClose = () => {
    setName("");
    setInstructions("");
    setNameCharCount(0);
    setInstructionsCharCount(0);
    setFormErrors([]);
    setServerError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!serverError;
  const hasChanges =
    name.trim() !== (initialData?.name ?? "").trim() ||
    instructions.trim() !== (initialData?.instructions ?? "").trim();

  const nameIsNearLimit = nameCharCount >= NAME_MAX - 10 && nameCharCount <= NAME_MAX;
  const nameIsAtLimit = nameCharCount >= NAME_MAX;

  const instrIsNearLimit = instructionsCharCount >= INSTRUCTIONS_MAX - 10 && instructionsCharCount <= INSTRUCTIONS_MAX;
  const instrIsAtLimit = instructionsCharCount >= INSTRUCTIONS_MAX;

  const getInputBorderColor = (hasFieldErrors: boolean, isNearLimit: boolean, isAtLimit: boolean) => {
    if (hasFieldErrors) return 'border-red-500 focus:ring-red-400';
    if (isAtLimit) return 'border-red-300 focus:ring-red-400';
    if (isNearLimit) return 'border-amber-300 focus:ring-amber-400';
    return 'border-gray-300 focus:ring-[#DDC9A3]';
  };

  const getProgressBarColor = (isAtLimit: boolean, isNearLimit: boolean) => {
    if (isAtLimit) return 'bg-red-600';
    if (isNearLimit) return 'bg-amber-500';
    return 'bg-[#DDC9A3]';
  };

  const getCharCountColor = (isAtLimit: boolean, isNearLimit: boolean) => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-gray-500';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      ></div>

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
              {/* Campo Nombre */}
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="SectionName" className="block text-sm font-medium text-gray-700">
                  Nombre de la Sección:
                </label>
                <span className={`text-xs font-medium ${getCharCountColor(nameIsAtLimit, nameIsNearLimit)}`}>
                  {nameCharCount}/{NAME_MAX} caracteres
                </span>
              </div>
              <input
                type="text"
                id="SectionName"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingresar nombre..."
                maxLength={NAME_MAX}
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(
                  hasClientErrors || hasServerError,
                  nameIsNearLimit,
                  nameIsAtLimit
                )}`}
                disabled={isSubmitting || isViewOnly}
                autoFocus={!isViewOnly}
              />
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-300 ${getProgressBarColor(nameIsAtLimit, nameIsNearLimit)}`}
                  style={{ width: `${(nameCharCount / NAME_MAX) * 100}%` }}
                />
              </div>

              {/* Campo Instrucciones */}
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="SectionInstructions" className="block text-sm font-medium text-gray-700">
                  Instrucciones (Opcional):
                </label>
                <span className={`text-xs font-medium ${getCharCountColor(instrIsAtLimit, instrIsNearLimit)}`}>
                  {instructionsCharCount}/{INSTRUCTIONS_MAX} caracteres
                </span>
              </div>
              <textarea
                id="SectionInstructions"
                value={instructions}
                onChange={handleInstructionsChange}
                placeholder="Escribe las instrucciones aquí..."
                rows={4}
                maxLength={INSTRUCTIONS_MAX}
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(
                  hasClientErrors || hasServerError,
                  instrIsNearLimit,
                  instrIsAtLimit
                )}`}
                disabled={isSubmitting || isViewOnly}
              />
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${getProgressBarColor(instrIsAtLimit, instrIsNearLimit)}`}
                  style={{ width: `${(instructionsCharCount / INSTRUCTIONS_MAX) * 100}%` }}
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
                {isViewOnly ? "Cerrar" : "Cancelar"}
              </button>
              {!isViewOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting || hasClientErrors || !hasChanges}
                  className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}