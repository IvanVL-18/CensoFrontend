import { useState, useCallback } from "react";
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

export function useAreasMutations({
  refreshAreas,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseAreasMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingArea?: Area | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const AreaData = { name };
        if (editingArea) {
          response = await updateArea(editingArea.id, AreaData);
        } else {
          response = await createArea(AreaData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshAreas();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
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
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banArea(Area.id);
        } else if (type === "restore") {
          response = await restoreArea(Area.id);
        } else if (type === "delete") {
          response = await forceDeleteArea(Area.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshAreas();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshAreas],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importAreas(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshAreas();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshAreas();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshAreas],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
