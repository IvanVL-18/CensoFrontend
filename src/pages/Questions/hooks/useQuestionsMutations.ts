import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createQuestion,
  updateQuestion,
  banQuestion,
  restoreQuestion,
  forceDeleteQuestion,
  importQuestions,
} from "../Questions.service";
import type { Question } from "../Questions.types";

interface UseQuestionsMutationsProps {
  refreshQuestions: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useQuestionsMutations({
  refreshQuestions,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseQuestionsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (data: any, editingQuestion?: Question | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        if (editingQuestion) {
          response = await updateQuestion(editingQuestion.id, data);
        } else {
          response = await createQuestion(data);
        }

        addToast(response.message, "success");
        closeForm();
        refreshQuestions();
      } catch (err: any) {
        const laravelErrors = err.response?.data?.errors as
          | Record<string, string[]>
          | undefined;

        if (laravelErrors) {
          const allMessages = Object.values(laravelErrors).flat().join(" | ");
          setMutationError(allMessages);
          addToast(allMessages, "danger");
        } else {
          const msg =
            err.response?.data?.message || err.message || "Error al guardar";
          setMutationError(msg);
          addToast(msg, "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshQuestions],
  );

  const handleConfirmAction = useCallback(
    async (
      Question: Question | null,
      type: "ban" | "restore" | "delete" | null,
    ) => {
      if (!Question || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banQuestion(Question.id);
        else if (type === "restore") response = await restoreQuestion(Question.id);
        else if (type === "delete") response = await forceDeleteQuestion(Question.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshQuestions();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshQuestions],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importQuestions(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshQuestions();
      } catch (err: any) {
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshQuestions();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshQuestions],
  );

  return {
    isSubmitting,
    mutationError,       
    clearMutationError,  
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}