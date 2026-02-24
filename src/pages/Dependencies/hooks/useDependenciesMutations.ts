import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createDependencie,
  updateDependencie,
  banDependencie,
  restoreDependencie,
  forceDeleteDependencie,
  importDependencies,
} from "../Dependencies.service";
import type { Dependencie } from "../Dependencies.types";

interface UseDependenciesMutationsProps {
  refreshDependencies: () => void;
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

export function useDependenciesMutations({
  refreshDependencies,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseDependenciesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingDependencie?: Dependencie | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const DependencieData = { name: name.trim() };

        const response = editingDependencie
          ? await updateDependencie(editingDependencie.id, DependencieData)
          : await createDependencie(DependencieData);

        addToast(response.message, "success");
        closeForm();
        refreshDependencies();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshDependencies],
  );

  const handleConfirmAction = useCallback(
    async (Dependencie: Dependencie | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Dependencie || !type) return;

      setIsSubmitting(true);
      setMutationError(null); 

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banDependencie(Dependencie.id);
        else if (type === "restore") response = await restoreDependencie(Dependencie.id);
        else if (type === "delete") response = await forceDeleteDependencie(Dependencie.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshDependencies();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshDependencies],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importDependencies(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshDependencies();
      } catch (err: unknown) {

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast("El archivo contiene errores que debes corregir", "warning");
            refreshDependencies();
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
    [addToast, openBulkError, refreshDependencies],
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
