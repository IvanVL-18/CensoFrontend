import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createUnit,
  updateUnit,
  banUnit,
  restoreUnit,
  forceDeleteUnit,
  importUnits,
} from "../units.service";
import type { Unit } from "../units.types";

interface UseUnitsMutationsProps {
  refreshUnits: () => void;
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
      const first = (Object.values(data.errors).flat() as any[])?.[0];
      if (typeof first === "string" && first.trim()) return first;
    }

    return err.message || "Error al procesar la solicitud";
  }

  if (err instanceof Error) return err.message;
  return "Error al procesar la solicitud";
}

export function useUnitsMutations({
  refreshUnits,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseUnitsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingUnit?: Unit | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const unitData = { name: name.trim() };

        const response = editingUnit
          ? await updateUnit(editingUnit.id, unitData)
          : await createUnit(unitData);

        addToast(response.message, "success");
        closeForm();
        refreshUnits();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshUnits],
  );

  const handleConfirmAction = useCallback(
    async (unit: Unit | null, type: "ban" | "restore" | "delete" | null) => {
      if (!unit || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banUnit(unit.id);
        else if (type === "restore") response = await restoreUnit(unit.id);
        else if (type === "delete") response = await forceDeleteUnit(unit.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshUnits();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshUnits],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importUnits(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshUnits();
      } catch (err: unknown) {
        console.error("Error en carga masiva:", err);

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast("El archivo contiene errores que debes corregir", "warning");
            refreshUnits();
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
    [addToast, openBulkError, refreshUnits],
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
