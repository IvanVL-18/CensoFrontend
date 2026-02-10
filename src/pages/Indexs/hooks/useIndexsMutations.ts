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

export function useIndexsMutations({
  refreshIndexs,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseIndexsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingIndex?: Index | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const IndexData = { name };
        if (editingIndex) {
          response = await updateIndex(editingIndex.id, IndexData);
        } else {
          response = await createIndex(IndexData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshIndexs();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
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
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banIndex(Index.id);
        } else if (type === "restore") {
          response = await restoreIndex(Index.id);
        } else if (type === "delete") {
          response = await forceDeleteIndex(Index.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshIndexs();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshIndexs],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importIndexs(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshIndexs();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshIndexs();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
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
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
