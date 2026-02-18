import { useState, useCallback } from "react";
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

export function useUnitsMutations({
  refreshUnits,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseUnitsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingUnit?: Unit | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const unitData = { name };
        if (editingUnit) {
          response = await updateUnit(editingUnit.id, unitData);
        } else {
          response = await createUnit(unitData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshUnits();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
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
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banUnit(unit.id);
        } else if (type === "restore") {
          response = await restoreUnit(unit.id);
        } else if (type === "delete") {
          response = await forceDeleteUnit(unit.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshUnits();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshUnits],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importUnits(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshUnits();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshUnits();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false); 
      }
    },
    [addToast, openBulkError, refreshUnits],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
