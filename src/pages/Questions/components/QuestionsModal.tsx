import { useState, useEffect, type FormEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { QuestionModalProps, CreateQuestionDTO } from "../Questions.types";
import { Questionschema } from "../schemas/Questionsschema";
import { CharCountInput } from "../../../components/CharCountInput";

const NAME_MAX_LENGTH = 913;
const INSTRUCTIONS_MAX_LENGTH = 7500;

export function QuestionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData,
  onClose,
  onSave,
  onClearServerError,
}: QuestionModalProps) {
  const [formData, setFormData] = useState<CreateQuestionDTO>({
    name: "",
    instructions: "",
    commentaries: false,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setServerError(error || null);
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name ?? "",
        instructions: initialData?.instructions ?? "",
        commentaries: Boolean(initialData?.commentaries),
      });
      setFormErrors([]);
      setServerError(null);
      onClearServerError();
    }
  }, [isOpen, initialData, onClearServerError]);

  const validateForm = (data: CreateQuestionDTO) => {
    const result = Questionschema.safeParse(data);
    if (!result.success) {
      setFormErrors(result.error.issues.map((e) => e.message));
      return false;
    }
    setFormErrors([]);
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm(formData)) onSave(formData);
  };

  const handleClose = () => {
    setFormData({ name: "", instructions: "", commentaries: false });
    setFormErrors([]);
    setServerError(null);
    onClearServerError();
    onClose();
  };

  if (!isOpen) return null;

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!serverError;

  const isUnchanged =
    formData.name.trim() === (initialData?.name ?? "").trim() &&
    (formData.instructions ?? "").trim() === (initialData?.instructions ?? "").trim() &&
    formData.commentaries === Boolean(initialData?.commentaries);

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
              <CharCountInput
                as="textarea"
                id="name"
                label="Pregunta:"
                value={formData.name}
                maxLength={NAME_MAX_LENGTH}
                placeholder="Escribe la pregunta..."
                disabled={isSubmitting}
                hasError={hasClientErrors}
                autoFocus
                rows={2}
                onChange={(val) => {
                  const newData = { ...formData, name: val };
                  setFormData(newData);
                  setServerError(null);
                  if (error) onClearServerError();
                  validateForm(newData);
                }}
              />

              <CharCountInput
                as="textarea"
                id="instructions"
                label="Instrucciones (Opcional):"
                value={formData.instructions ?? ""}
                maxLength={INSTRUCTIONS_MAX_LENGTH}
                placeholder="Instrucciones detalladas para responder..."
                disabled={isSubmitting}
                rows={4}
                nearLimitOffset={100}
                onChange={(val) => {
                  const newData = { ...formData, instructions: val };
                  setFormData(newData);
                  setServerError(null);
                  if (error) onClearServerError();
                  validateForm(newData);
                }}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="commentaries"
                  name="commentaries"
                  checked={formData.commentaries}
                  onChange={(e) => {
                    const newData = { ...formData, commentaries: e.target.checked };
                    setFormData(newData);
                    validateForm(newData);
                  }}
                  className="w-5 h-5 text-[#691b31] border-gray-300 rounded focus:ring-[#691b31]"
                  disabled={isSubmitting}
                />
                <label htmlFor="commentaries" className="text-sm font-medium text-gray-700 select-none">
                  ¿Habilitar campo de comentarios extra?
                </label>
              </div>

              {hasClientErrors && (
                <div id="form-errors-client">
                  <FormErrors errors={formErrors} />
                </div>
              )}
              {hasServerError && (
                <div id="form-errors-server">
                  <FormErrors errors={[serverError!]} />
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t">
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
                disabled={isSubmitting || hasClientErrors || isUnchanged}
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
