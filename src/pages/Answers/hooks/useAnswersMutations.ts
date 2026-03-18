import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createquestion,
  updatequestion,
  banquestion,
  restorequestion,
  forceDeletequestion,
  importquestions,
} from "../Answers.service";
import type { question } from "../Answers.types";

interface UsequestionsMutationsProps {
  refreshquestions: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function usequestionsMutations({
  refreshquestions,
  closeForm,
  closeConfirm,
  openBulkError,
}: UsequestionsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (data: any, editingquestion?: question | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        if (editingquestion) {
          response = await updatequestion(editingquestion.id, data);
        } else {
          response = await createquestion(data);
        }

        addToast(response.message, "success");
        closeForm();
        refreshquestions();
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
    [addToast, closeForm, refreshquestions],
  );

  const handleConfirmAction = useCallback(
    async (
      question: question | null,
      type: "ban" | "restore" | "delete" | null,
    ) => {
      if (!question || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banquestion(question.id);
        else if (type === "restore") response = await restorequestion(question.id);
        else if (type === "delete") response = await forceDeletequestion(question.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshquestions();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshquestions],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importquestions(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshquestions();
      } catch (err: any) {
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshquestions();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshquestions],
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