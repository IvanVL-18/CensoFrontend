import React, { useState, useEffect, type ChangeEvent } from "react";
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
      onClearServerError?.();
    }
  }, [isOpen, initialData, onClearServerError]);

  // Validación evitando duplicados
  const validateForm = (data: CreateQuestionDTO) => {
    const result = Questionschema.safeParse(data);
    const errorsSet = new Set<string>();

    if (!data.name || data.name.trim().length < 5) {
      errorsSet.add("El nombre debe tener al menos 5 caracteres.");
    }

    if (!data.name || data.name.trim() === "") {
      errorsSet.add("El nombre es obligatorio.");
    }

    if (!result.success) {
      result.error.issues.forEach(e => errorsSet.add(e.message));
    }

    const errors = Array.from(errorsSet);
    setFormErrors(errors);

    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm(formData)) onSave(formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError(null);
    onClearServerError?.();
    validateForm({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, commentaries: e.target.checked }));
    setServerError(null);
    onClearServerError?.();
  };

  const handleClose = () => {
    setFormData({ name: "", instructions: "", commentaries: false });
    setFormErrors([]);
    setServerError(null);
    onClearServerError?.();
    onClose();
  };

  if (!isOpen) return null;

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!serverError;
  const isUnchanged =
    formData.name.trim() === (initialData?.name ?? "").trim() &&
    (formData.instructions ?? "").trim() === (initialData?.instructions ?? "").trim() &&
    formData.commentaries === Boolean(initialData?.commentaries);

  const getProgress = (value: number, max: number) => Math.min(100, (value / max) * 100);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-[#891b28]">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">

              {/* Pregunta */}
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="name" className="text-sm font-medium text-black">
                    Pregunta:
                  </label>
                  <span className="text-xs text-gray-500 font-semibold">
                    {formData.name.length}/200 caracteres
                  </span>
                </div>
                <textarea
                  id="name"
                  name="name"
                  rows={2}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Escribe la pregunta..."
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#F2C27A] text-black"
                  disabled={isSubmitting}
                  autoFocus
                  maxLength={200}
                />
                <div className="h-1 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-1 bg-[#F2C27A] rounded-full transition-all"
                    style={{ width: `${getProgress(formData.name.length, 200)}%` }}
                  />
                </div>
              </div>

              {/* Instrucciones */}
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="instructions" className="text-sm font-medium text-black">
                    Instrucciones (Opcional):
                  </label>
                  <span className="text-xs text-gray-500 font-semibold">
                    {(formData.instructions ?? "").length}/500 caracteres
                  </span>
                </div>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={4}
                  value={formData.instructions ?? ""}
                  onChange={handleChange}
                  placeholder="Instrucciones detalladas para responder..."
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#F2C27A] text-black"
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="h-1 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-1 bg-[#F2C27A] rounded-full transition-all"
                    style={{ width: `${getProgress(formData.instructions?.length ?? 0, 500)}%` }}
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="commentaries"
                  name="commentaries"
                  checked={formData.commentaries}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-[#891b28] border-gray-300 rounded focus:ring-[#891b28]"
                  disabled={isSubmitting}
                />
                <label htmlFor="commentaries" className="text-sm font-medium text-gray-700 select-none">
                  ¿Habilitar campo de comentarios extra?
                </label>
              </div>

              {/* Errores */}
              {hasClientErrors && <FormErrors errors={formErrors} />}
              {hasServerError && <FormErrors errors={[serverError!]} />}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 p-4 bg-gray-50 border-t">
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
                className="bg-white border border-[#891b28] text-[#891b28] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
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