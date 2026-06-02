import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createIndicator,
  updateIndicator,
  banIndicator,
  restoreIndicator,
  forceDeleteIndicator,
  importIndicators,
} from "../Indicators.service";
import type { Indicator } from "../Indicators.types";

interface UseIndicatorsMutationsProps {
  refreshIndicators: () => void;
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

export function useIndicatorsMutations({
  refreshIndicators,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseIndicatorsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingIndicator?: Indicator | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const IndicatorData = { name: name.trim() };

        const response = editingIndicator
          ? await updateIndicator(editingIndicator.id, IndicatorData)
          : await createIndicator(IndicatorData);

        addToast(response.message, "success");
        closeForm();
        refreshIndicators();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshIndicators],
  );

  const handleConfirmAction = useCallback(
    async (
      Indicator: Indicator | null,
      type: "ban" | "restore" | "delete" | null,
    ) => {
      if (!Indicator || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banIndicator(Indicator.id);
        else if (type === "restore")
          response = await restoreIndicator(Indicator.id);
        else if (type === "delete")
          response = await forceDeleteIndicator(Indicator.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshIndicators();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshIndicators],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importIndicators(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshIndicators();
      } catch (err: unknown) {
        console.error("Error en carga masiva:", err);

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast(
              "El archivo contiene errores que debes corregir",
              "warning",
            );
            refreshIndicators();
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
    [addToast, openBulkError, refreshIndicators],
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
