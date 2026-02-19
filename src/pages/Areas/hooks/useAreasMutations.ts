import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createArea,
  updateArea,
  banArea,
  restoreArea,
  forceDeleteArea,
  importAreas,
} from "../Areas.service";
import type { Area } from "../Areas.types";

interface UseAreasMutationsProps {
  refreshAreas: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).flat()?.[0];
      if (typeof first === "string" && first.trim()) return first;
    }

    return err.message || "Error al procesar la solicitud";
  }

  if (err instanceof Error) return err.message;
  return "Error al procesar la solicitud";
}

export function useAreasMutations({
  refreshAreas,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseAreasMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingArea?: Area | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const AreaData = { name: name.trim() };

        const response = editingArea
          ? await updateArea(editingArea.id, AreaData)
          : await createArea(AreaData);

        addToast(response.message, "success");
        closeForm();
        refreshAreas();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshAreas],
  );

  const handleConfirmAction = useCallback(
    async (Area: Area | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Area || !type) return;

      setIsSubmitting(true);
      setMutationError(null); 

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banArea(Area.id);
        else if (type === "restore") response = await restoreArea(Area.id);
        else if (type === "delete") response = await forceDeleteArea(Area.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshAreas();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshAreas],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importAreas(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshAreas();
      } catch (err: unknown) {

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast("El archivo contiene errores que debes corregir", "warning");
            refreshAreas();
            return;
          }

          const msg = getErrorMessage(err);
          addToast(msg, "danger");
          return;
        }

        addToast("Error al subir el archivo", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshAreas],
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
