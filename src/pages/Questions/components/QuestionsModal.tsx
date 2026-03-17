import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { QuestionModalProps, CreateQuestionDTO } from "../Questions.types";
import { Questionschema } from "../schemas/Questionsschema";

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
  const [serverError, setServerError] = useState<string | null>(null); // ← estado interno

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setServerError(null);
    if (error) onClearServerError();

    const newData = { ...formData, [name]: value };
    setFormData(newData);
    validateForm(newData); 
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    if (error) onClearServerError();

    const newData = { ...formData, commentaries: e.target.checked };
    setFormData(newData);
    validateForm(newData); 
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

  const isUnchanged = initialData
    ? formData.name.trim() === initialData.name.trim() &&
      (formData.instructions ?? "").trim() ===
        (initialData.instructions ?? "").trim() &&
      formData.commentaries === Boolean(initialData.commentaries)
    : false;

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
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pregunta:
                </label>
                <textarea
                  id="name"
                  name="name"
                  rows={2}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Escribe la pregunta..."
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="instructions"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Instrucciones (Opcional):
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={4}
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Instrucciones detalladas para responder..."
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="commentaries"
                  name="commentaries"
                  checked={formData.commentaries}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-[#691b31] border-gray-300 rounded focus:ring-[#691b31]"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="commentaries"
                  className="text-sm font-medium text-gray-700 select-none"
                >
                  ¿Habilitar campo de comentarios extra?
                </label>
              </div>

              {/* Errores cliente (Zod) */}
              {hasClientErrors && (
                <div id="form-errors-client">
                  <FormErrors errors={formErrors} />
                </div>
              )}

              {/* Errores servidor (Laravel) — igual que DependenciesModal */}
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
                disabled={
                  isSubmitting ||
                  hasClientErrors ||
                  (isUnchanged && !hasServerError)
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
