import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createDependencia,
  updateDependencia,
  banDependencia,
  restoreDependencia,
  forceDeleteDependencia,
  importDependencias,
} from "../Dependencias.service";
import type { Dependencia } from "../Dependencias.types";

interface UseDependenciasMutationsProps {
  refreshDependencias: () => void;
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

export function useDependenciasMutations({
  refreshDependencias,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseDependenciasMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingDependencia?: Dependencia | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const DependenciaData = { name: name.trim() };

        const response = editingDependencia
          ? await updateDependencia(editingDependencia.id, DependenciaData)
          : await createDependencia(DependenciaData);

        addToast(response.message, "success");
        closeForm();
        refreshDependencias();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshDependencias],
  );

  const handleConfirmAction = useCallback(
    async (Dependencia: Dependencia | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Dependencia || !type) return;

      setIsSubmitting(true);
      setMutationError(null); 

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banDependencia(Dependencia.id);
        else if (type === "restore") response = await restoreDependencia(Dependencia.id);
        else if (type === "delete") response = await forceDeleteDependencia(Dependencia.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshDependencias();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshDependencias],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importDependencias(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshDependencias();
      } catch (err: unknown) {

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast("El archivo contiene errores que debes corregir", "warning");
            refreshDependencias();
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
    [addToast, openBulkError, refreshDependencias],
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
