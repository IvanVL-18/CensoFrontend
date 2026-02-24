import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createRol,
  updateRol,
  banRol,
  restoreRol,
  forceDeleteRol,
  importRoles,
} from "../Roles.service";
import type { Rol } from "../Roles.types";

interface UseRolesMutationsProps {
  refreshRoles: () => void;
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

export function useRolesMutations({
  refreshRoles,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseRolesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingRol?: Rol | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const RolData = { name: name.trim() };

        const response = editingRol
          ? await updateRol(editingRol.id, RolData)
          : await createRol(RolData);

        addToast(response.message, "success");
        closeForm();
        refreshRoles();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshRoles],
  );

  const handleConfirmAction = useCallback(
    async (Rol: Rol | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Rol || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banRol(Rol.id);
        else if (type === "restore") response = await restoreRol(Rol.id);
        else if (type === "delete") response = await forceDeleteRol(Rol.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshRoles();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshRoles],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importRoles(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshRoles();
      } catch (err: unknown) {
        console.error("Error en carga masiva:", err);

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast("El archivo contiene errores que debes corregir", "warning");
            refreshRoles();
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
    [addToast, openBulkError, refreshRoles],
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
