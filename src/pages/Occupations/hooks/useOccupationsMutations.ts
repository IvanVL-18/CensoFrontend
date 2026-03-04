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

  currentOccupations: Occupation[];
}

function normalizeName(v: string) {
  return v.trim().toLowerCase();
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

export function useOccupationsMutations({
  refreshOccupations,
  closeForm,
  closeConfirm,
  openBulkError,
  currentOccupations,
}: UseOccupationsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingOccupation?: Occupation | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      const newName = normalizeName(name);

      const exists = currentOccupations.some((o) => {
        const sameName = normalizeName(o.name) === newName;
        const sameRecord = editingOccupation ? String(o.id) === String(editingOccupation.id) : false;
        return sameName && !sameRecord;
      });

      if (exists) {
        const msg = "El nombre de la ocupación ya está en uso.";
        setMutationError(msg);
        addToast(msg, "danger");
        setIsSubmitting(false);
        return;
      }

      try {
        const OccupationData = { name: name.trim() };

        const response = editingOccupation
          ? await updateOccupation(editingOccupation.id, OccupationData)
          : await createOccupation(OccupationData);

        addToast(response.message, "success");
        closeForm();
        refreshOccupations();
      } catch (err: any) {
        const msg = getApiErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshOccupations, currentOccupations],
  );

  const handleConfirmAction = useCallback(
    async (Occupation: Occupation | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Occupation || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banOccupation(Occupation.id);
        else if (type === "restore") response = await restoreOccupation(Occupation.id);
        else if (type === "delete") response = await forceDeleteOccupation(Occupation.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshOccupations();
        }
      } catch (err: any) {
        const msg = getApiErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshOccupations],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importOccupations(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshOccupations();
      } catch (err: any) {
        const status = err?.response?.status;
        const data = err?.response?.data;

        if (status === 422 && data?.errors) {
          openBulkError(data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshOccupations();
        } else {
          const msg = getApiErrorMessage(err);
          setMutationError(msg);
          addToast(msg, "danger");
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
    clearMutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}