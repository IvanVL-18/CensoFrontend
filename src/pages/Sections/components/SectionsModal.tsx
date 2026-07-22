import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { SectionModalProps, Indicator } from "../Sections.types";
import { getIndicators } from "../sections.service";
import { Sectionschema } from "../schemas/Sections.schema";

const NAME_MAX = 180;
const INSTRUCTIONS_MAX = 7600;

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
  const [indicatorId, setIndicatorId] = useState<string | null>(null);
  const [initialIndicatorId, setInitialIndicatorId] = useState<string | null>(
    null,
  );
  const [needsAttention, setNeedsAttention] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [nameCharCount, setNameCharCount] = useState(0);
  const [instructionsCharCount, setInstructionsCharCount] = useState(0);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [indicatorsError, setIndicatorsError] = useState<string | null>(null);

  // Fetch indicators when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingIndicators(true);
    setIndicatorsError(null);
    getIndicators()
      .then((data) => {
        const sortedIndicators = [...data].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setIndicators(sortedIndicators);
      })
      .catch(() => {
        setIndicatorsError("No se pudieron cargar los indicadores.");
      })
      .finally(() => {
        setLoadingIndicators(false);
      });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setInstructions(initialData?.instructions || "");
      setIndicatorId(null);
      setInitialIndicatorId(null);
      setNeedsAttention(!!initialData?.attention);
      setNameCharCount(initialData?.name?.length || 0);
      setInstructionsCharCount(initialData?.instructions?.length || 0);
      setFormErrors([]);
      setServerError(null);
    }
  }, [isOpen, initialData]);

  // Preselecciona el indicador por nombre: la API cifra los ids con IV
  // aleatorio, por lo que el id de la sección nunca coincide con los del listado
  useEffect(() => {
    if (!isOpen || !initialData?.indicator_name || indicators.length === 0)
      return;
    const target = initialData.indicator_name.trim().toLowerCase();
    const match = indicators.find(
      (ind) => ind.name.trim().toLowerCase() === target,
    );
    const id = match?.id ?? null;
    setIndicatorId(id);
    setInitialIndicatorId(id);
  }, [isOpen, initialData, indicators]);

  useEffect(() => {
    if (error) {
      setServerError(error);
    } else {
      setServerError(null);
    }
  }, [error]);

  const validateForm = (
    currentName: string,
    currentInstructions: string,
    currentIndicatorId: string | null,
    currentNeedsAttention: boolean,
  ) => {
    const result = Sectionschema.safeParse({
      name: currentName,
      instructions: currentInstructions,
      indicator_id: currentIndicatorId,
      attention: currentNeedsAttention,
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

    const isValid = validateForm(
      name,
      instructions,
      indicatorId,
      needsAttention,
    );
    if (!isValid) return;

    const isEditMode = !!initialData;

    const initialName = (initialData?.name ?? "").trim();
    const initialInstr = (initialData?.instructions ?? "").trim();
    const initialNeedsAttention = !!initialData?.attention;

    const currentName = name.trim();
    const currentInstr = instructions.trim();
    if (isEditMode) {
      const patch: any = {};

      if (currentName !== initialName) patch.name = currentName;

      if (currentInstr !== initialInstr) {
        patch.instructions = currentInstr === "" ? null : currentInstr;
      }

      if (indicatorId !== initialIndicatorId) patch.indicator_id = indicatorId;
      if (needsAttention !== initialNeedsAttention)
        patch.attention = needsAttention;

      onSave(patch);
      return;
    }

    onSave({
      name: currentName,
      ...(currentInstr ? { instructions: currentInstr } : {}),
      indicator_id: indicatorId,
      attention: needsAttention,
    });
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName.length <= NAME_MAX) {
      setName(newName);
      setNameCharCount(newName.length);
      validateForm(newName, instructions, indicatorId, needsAttention);
      if (serverError) setServerError(null);
    }
  };

  const handleInstructionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newInstructions = e.target.value;
    if (newInstructions.length <= INSTRUCTIONS_MAX) {
      setInstructions(newInstructions);
      setInstructionsCharCount(newInstructions.length);
      validateForm(name, newInstructions, indicatorId, needsAttention);
      if (serverError) setServerError(null);
    }
  };

  const handleIndicatorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || null;
    setIndicatorId(val);
    validateForm(name, instructions, val, needsAttention);
    if (serverError) setServerError(null);
  };

  const handleNeedsAttentionChange = (value: boolean) => {
    if (isViewOnly || isSubmitting) return;
    setNeedsAttention(value);
    validateForm(name, instructions, indicatorId, value);
  };

  const handleClose = () => {
    setName("");
    setInstructions("");
    setIndicatorId(null);
    setInitialIndicatorId(null);
    setNeedsAttention(false);
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
    instructions.trim() !== (initialData?.instructions ?? "").trim() ||
    indicatorId !== initialIndicatorId ||
    needsAttention !== !!initialData?.attention;

  const nameIsNearLimit =
    nameCharCount >= NAME_MAX - 10 && nameCharCount <= NAME_MAX;
  const nameIsAtLimit = nameCharCount >= NAME_MAX;

  const instrIsNearLimit =
    instructionsCharCount >= INSTRUCTIONS_MAX - 10 &&
    instructionsCharCount <= INSTRUCTIONS_MAX;
  const instrIsAtLimit = instructionsCharCount >= INSTRUCTIONS_MAX;

  const getInputBorderColor = (
    hasFieldErrors: boolean,
    isNearLimit: boolean,
    isAtLimit: boolean,
  ) => {
    if (hasFieldErrors) return "border-red-500 focus:ring-red-400";
    if (isAtLimit) return "border-red-300 focus:ring-red-400";
    if (isNearLimit) return "border-amber-300 focus:ring-amber-400";
    return "border-gray-300 focus:ring-[#DDC9A3]";
  };

  const getProgressBarColor = (isAtLimit: boolean, isNearLimit: boolean) => {
    if (isAtLimit) return "bg-red-600";
    if (isNearLimit) return "bg-amber-500";
    return "bg-[#DDC9A3]";
  };

  const getCharCountColor = (isAtLimit: boolean, isNearLimit: boolean) => {
    if (isAtLimit) return "text-red-600";
    if (isNearLimit) return "text-amber-600";
    return "text-gray-500";
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 overflow-y-auto flex-1">
              {/* Campo Nombre */}
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="SectionName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de la Sección:
                </label>
                <span
                  className={`text-xs font-medium ${getCharCountColor(nameIsAtLimit, nameIsNearLimit)}`}
                >
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
                  nameIsAtLimit,
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
                <label
                  htmlFor="SectionInstructions"
                  className="block text-sm font-medium text-gray-700"
                >
                  Instrucciones (Opcional):
                </label>
                <span
                  className={`text-xs font-medium ${getCharCountColor(instrIsAtLimit, instrIsNearLimit)}`}
                >
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
                  instrIsAtLimit,
                )}`}
                disabled={isSubmitting || isViewOnly}
              />
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${getProgressBarColor(instrIsAtLimit, instrIsNearLimit)}`}
                  style={{
                    width: `${(instructionsCharCount / INSTRUCTIONS_MAX) * 100}%`,
                  }}
                />
              </div>

              {/* Campo Indicador */}
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="SectionIndicator"
                  className="block text-sm font-medium text-gray-700"
                >
                  Indicador (Opcional):
                </label>
              </div>
              {loadingIndicators ? (
                <div className="border border-gray-300 rounded-lg p-2 w-full text-sm text-gray-400 bg-gray-50 mb-4">
                  Cargando indicadores...
                </div>
              ) : indicatorsError ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                  {indicatorsError}
                </div>
              ) : (
                <select
                  id="SectionIndicator"
                  value={indicatorId ?? ""}
                  onChange={handleIndicatorChange}
                  disabled={isSubmitting || isViewOnly}
                  className="border border-gray-300 rounded-lg p-2 w-full truncate focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] mb-4"
                >
                  <option value="">— Sin indicador —</option>
                  {indicators.map((ind) => {
                    const MAX_LENGTH = 45;
                    const displayName =
                      ind.name.length > MAX_LENGTH
                        ? `${ind.name.substring(0, MAX_LENGTH)}...`
                        : ind.name;

                    return (
                      <option key={ind.id} value={ind.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              )}

              {/* Campo Necesita Atención */}
              <div className="flex justify-between items-center mb-2">
                <span className="block text-sm font-medium text-gray-700">
                  Necesita Atención:
                </span>
              </div>
              <div className="flex gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => handleNeedsAttentionChange(true)}
                  disabled={isSubmitting || isViewOnly}
                  className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                    needsAttention
                      ? "bg-red-900 border-red-900 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-800"
                  } disabled:opacity-50 disabled:cursor-default`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleNeedsAttentionChange(false)}
                  disabled={isSubmitting || isViewOnly}
                  className={`flex-1 py-2 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                    !needsAttention
                      ? "bg-[#C3A67C] border-[#C3A67C] text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-[#C3A67C] hover:text-[#8a6f45]"
                  } disabled:opacity-50 disabled:cursor-default`}
                >
                  No
                </button>
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
