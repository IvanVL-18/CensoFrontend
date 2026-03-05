import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors"; // Asegúrate de tener este componente
import type { QuestionModalProps, CreateQuestionDTO } from "../Questions.types";
import { Questionschema } from "../schemas/Questionsschema";

export function QuestionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData, // CAMBIO: Recibimos el objeto completo, no solo el nombre
  onClose,
  onSave,
}: QuestionModalProps) {
  // Estados para cada campo
  const [formData, setFormData] = useState<CreateQuestionDTO>({
    name: "",
    instructions: "",
    commentaries: false,
  });
  
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Cargar datos al abrir
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          instructions: initialData.instructions || "",
          commentaries: Boolean(initialData.commentaries), // Asegurar booleano
        });
      } else {
        // Resetear si es crear nuevo
        setFormData({ name: "", instructions: "", commentaries: false });
      }
      setFormErrors([]);
    }
  }, [isOpen, initialData]);

  // Validar con Zod
  const validateForm = (data: CreateQuestionDTO) => {
    const result = Questionschema.safeParse(data);
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
    const isValid = validateForm(formData);
    if (isValid) {
      onSave(formData); // Enviamos el objeto completo
    }
  };

  // Handler genérico para inputs de texto/textarea
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Validar en tiempo real (opcional, puede ser pesado si el texto es largo)
      // validateForm(newData); 
      return newData;
    });
  };

  // Handler para checkbox
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, commentaries: checked }));
  };

  if (!isOpen) return null;

  const hasClientErrors = formErrors.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"> {/* Hice el modal más ancho (max-w-2xl) */}
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-4"> {/* Espaciado entre campos */}
              
              {/* Campo Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Pregunta:
                </label>
                <textarea
                  id="name"
                  name="name"
                  rows={2} // Un poco más alto por si la pregunta es larga
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Escribe la pregunta..."
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* Campo Instrucciones */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
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

              {/* Checkbox Comentarios */}
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
                <label htmlFor="commentaries" className="text-sm font-medium text-gray-700 select-none">
                  ¿Habilitar campo de comentarios extra?
                </label>
              </div>

              {/* Errores */}
              <div id="form-errors-client">
                <FormErrors errors={formErrors} />
              </div>

              {error && (
                 <div id="form-errors-server">
                   <FormErrors errors={[error]} />
                 </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t">
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
                disabled={isSubmitting || hasClientErrors}
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