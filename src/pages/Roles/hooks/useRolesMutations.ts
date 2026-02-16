import { useState, useCallback } from "react";
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

export function useRolesMutations({
  refreshRoles,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseRolesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingRol?: Rol | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const RolData = { name };
        if (editingRol) {
          response = await updateRol(editingRol.id, RolData);
        } else {
          response = await createRol(RolData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshRoles();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
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
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banRol(Rol.id);
        } else if (type === "restore") {
          response = await restoreRol(Rol.id);
        } else if (type === "delete") {
          response = await forceDeleteRol(Rol.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshRoles();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshRoles],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importRoles(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshRoles();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshRoles();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshRoles],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
