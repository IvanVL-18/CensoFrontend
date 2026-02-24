import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createIndex,
  updateIndex,
  banIndex,
  restoreIndex,
  forceDeleteIndex,
  importIndexs,
} from "../Indexs.service";
import type { Index } from "../Indexs.types";

interface UseIndexsMutationsProps {
  refreshIndexs: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

function getApiErrorMessage(err: any): string {
  const data = err?.response?.data;
  
  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstVal = firstKey ? data.errors[firstKey] : null;

    if (Array.isArray(firstVal) && firstVal.length) return String(firstVal[0]);
    if (typeof firstVal === "string") return firstVal;
  }

  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof err?.message === "string" && err.message.trim()) return err.message;

  return "Error al procesar la solicitud";
}

export function useIndexsMutations({
  refreshIndexs,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseIndexsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingIndex?: Index | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const IndexData = { name: name.trim() };

        const response = editingIndex
          ? await updateIndex(editingIndex.id, IndexData)
          : await createIndex(IndexData);

        addToast(response.message, "success");
        closeForm();
        refreshIndexs();
      } catch (err: any) {
        const msg = getApiErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshIndexs],
  );

  const handleConfirmAction = useCallback(
    async (Index: Index | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Index || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banIndex(Index.id);
        else if (type === "restore") response = await restoreIndex(Index.id);
        else if (type === "delete") response = await forceDeleteIndex(Index.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshIndexs();
        }
      } catch (err: any) {
        const msg = getApiErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshIndexs],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importIndexs(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshIndexs();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);

        const status = err?.response?.status;
        const data = err?.response?.data;

        if (status === 422 && data?.errors) {
          openBulkError(data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshIndexs();
        } else {
          const msg = getApiErrorMessage(err);
          setMutationError(msg);
          addToast(msg, "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshIndexs],
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