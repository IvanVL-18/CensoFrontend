import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createPermission,
  updatePermission,
  banPermission,
  restorePermission,
  forceDeletePermission,
  importPermissions,
} from "../Permissions.service";
import type { Permission } from "../Permissions.types";

interface UsePermissionsMutationsProps {
  refreshPermissions: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function usePermissionsMutations({
  refreshPermissions,
  closeForm,
  closeConfirm,
  openBulkError,
}: UsePermissionsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingPermission?: Permission | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const PermissionData = { name };
        if (editingPermission) {
          response = await updatePermission(editingPermission.id, PermissionData);
        } else {
          response = await createPermission(PermissionData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshPermissions();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshPermissions],
  );

  const handleConfirmAction = useCallback(
    async (Permission: Permission | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Permission || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banPermission(Permission.id);
        } else if (type === "restore") {
          response = await restorePermission(Permission.id);
        } else if (type === "delete") {
          response = await forceDeletePermission(Permission.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshPermissions();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshPermissions],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importPermissions(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshPermissions();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshPermissions();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshPermissions],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
