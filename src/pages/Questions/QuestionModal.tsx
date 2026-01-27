// src/pages/questions/QuestionModal.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { CreateQuestionDTO, QuestionType } from "./questions.interfaces";

interface QuestionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;

  // ✅ Para edición, mandamos el detalle completo aquí
  initialData?: Partial<CreateQuestionDTO>;

  onClose: () => void;
  onSave: (payload: CreateQuestionDTO) => void;
}

const DEFAULT_TYPE: QuestionType = "empty";

export function QuestionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData,
  onClose,
  onSave,
}: QuestionModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<QuestionType>(DEFAULT_TYPE);
  const [commentaries, setCommentaries] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const needsOptions = type === "radio" || type === "check" || type === "selector";

  useEffect(() => {
    if (!isOpen) return;

    setFormErrors([]);
    setName(initialData?.name ?? "");
    setType((initialData?.type as QuestionType) ?? DEFAULT_TYPE);
    setCommentaries(Boolean(initialData?.commentaries ?? false));
    setInstructions(initialData?.instructions ?? "");

    const initOpts =
      initialData?.options?.length
        ? initialData.options.map((o) => o.name)
        : [""];

    setOptions(initOpts);
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!needsOptions) setOptions([""]);
  }, [needsOptions]);

  const validate = (): string[] => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("La pregunta es obligatoria.");
    if (name.trim().length < 20) errs.push("La pregunta debe tener al menos 20 caracteres.");
    if (name.trim().length > 600) errs.push("La pregunta no debe exceder 600 caracteres.");

    if (instructions.trim()) {
      if (instructions.trim().length < 20) errs.push("Las instrucciones deben tener al menos 20 caracteres.");
      if (instructions.trim().length > 600) errs.push("Las instrucciones no deben exceder 600 caracteres.");
    }

    if (needsOptions) {
      const cleaned = options.map((o) => o.trim()).filter(Boolean);
      if (cleaned.length < 1) errs.push("Debes agregar al menos 1 opción.");

      cleaned.forEach((opt, idx) => {
        if (opt.length < 10) errs.push(`Opción #${idx + 1} debe tener al menos 10 caracteres.`);
        if (opt.length > 60) errs.push(`Opción #${idx + 1} no debe exceder 60 caracteres.`);
      });
    }

    return errs;
  };

  const payload: CreateQuestionDTO = useMemo(() => {
    const base: CreateQuestionDTO = {
      name: name.trim(),
      type,
      commentaries,
      instructions: instructions.trim() ? instructions.trim() : null,
    };

    if (needsOptions) {
      base.options = options
        .map((o) => o.trim())
        .filter(Boolean)
        .map((o) => ({ name: o }));
    }

    return base;
  }, [name, type, commentaries, instructions, needsOptions, options]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFormErrors(errs);
    if (errs.length === 0) onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300" aria-label="Cerrar modal">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4">
              {/* NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pregunta / Módulo:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormErrors([]);
                  }}
                  placeholder="Escribe la pregunta..."
                  className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo:
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as QuestionType)}
                  disabled={isSubmitting}
                  className="border rounded-lg p-2 w-full bg-white focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#DDC9A3]"
                >
                  <option value="empty">Empty (sin opciones)</option>
                  <option value="radio">Radio</option>
                  <option value="check">Check</option>
                  <option value="selector">Selector</option>
                </select>
              </div>

              {/* COMMENTARIES */}
              <div className="flex items-center gap-3">
                <input
                  id="commentaries"
                  type="checkbox"
                  checked={commentaries}
                  onChange={(e) => setCommentaries(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4"
                />
                <label htmlFor="commentaries" className="text-sm text-gray-700">
                  Permitir comentarios (commentaries)
                </label>
              </div>

              {/* INSTRUCTIONS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones (opcional):
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#DDC9A3]"
                  placeholder="Escribe instrucciones..."
                />
              </div>

              {/* OPTIONS */}
              {needsOptions && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Opciones:
                    </label>

                    <button
                      type="button"
                      onClick={() => setOptions((prev) => [...prev, ""])}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#691b31] hover:opacity-80"
                    >
                      <Plus size={18} />
                      Agregar opción
                    </button>
                  </div>

                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const v = e.target.value;
                          setOptions((prev) => prev.map((p, i) => (i === idx ? v : p)));
                        }}
                        disabled={isSubmitting}
                        className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#DDC9A3]"
                        placeholder={`Opción ${idx + 1}`}
                      />
                      <button
                        type="button"
                        title="Quitar"
                        onClick={() => {
                          setOptions((prev) => {
                            const copy = [...prev];
                            copy.splice(idx, 1);
                            return copy.length ? copy : [""];
                          });
                        }}
                        disabled={isSubmitting}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ERRORES */}
              <FormErrors errors={formErrors} />
              {error && <FormErrors errors={[error]} />}
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
                disabled={isSubmitting}
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
