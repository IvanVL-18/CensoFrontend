import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createOccupation,
  updateOccupation,
  banOccupation,
  restoreOccupation,
  forceDeleteOccupation,
  importOccupations,
} from "../Occupations.service";
import type { Occupation } from "../Occupations.types";

interface UseOccupationsMutationsProps {
  refreshOccupations: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useOccupationsMutations({
  refreshOccupations,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseOccupationsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingOccupation?: Occupation | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const OccupationData = { name };
        if (editingOccupation) {
          response = await updateOccupation(editingOccupation.id, OccupationData);
        } else {
          response = await createOccupation(OccupationData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshOccupations();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshOccupations],
  );

  const handleConfirmAction = useCallback(
    async (Occupation: Occupation | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Occupation || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banOccupation(Occupation.id);
        } else if (type === "restore") {
          response = await restoreOccupation(Occupation.id);
        } else if (type === "delete") {
          response = await forceDeleteOccupation(Occupation.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshOccupations();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshOccupations],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importOccupations(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshOccupations();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshOccupations();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshOccupations],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
