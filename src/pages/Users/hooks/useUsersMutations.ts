import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createUser,
  updateUser,
  banUser,
  restoreUser,
  forceDeleteUser,
  importUsers,
} from "../Users.service";
import type { User, CreateUserDTO, UpdateUserDTO } from "../Users.types";

interface UseUsersMutationsProps {
  refreshUsers: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
  closeExtra: () => void;
  patchUser?: (id: string | number, patch: Partial<User>) => void;
}

export function useUsersMutations({
  refreshUsers,
  closeForm,
  closeConfirm,
  openBulkError,
  closeExtra,
  patchUser, 
}: UseUsersMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const resetMutationError = () => setMutationError(null);
  const [isExtraSubmitting, setIsExtraSubmitting] = useState(false);
  const [extraError, setExtraError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (userData: CreateUserDTO, editingUser?: User | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        if (editingUser) {
          const updateData: UpdateUserDTO = { ...userData };
          if (updateData.email === editingUser.email) {
            delete updateData.email;
          }

          if (!updateData.password) {
            delete updateData.password;
            delete updateData.password_confirmation;
          }
          response = await updateUser(editingUser.id, updateData);
        } else {
          response = await createUser(userData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshUsers();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshUsers],
  );

  
  const handleSaveExtra = useCallback(
    async (User: User, extraData: UpdateUserDTO) => {
      setIsExtraSubmitting(true);
      setExtraError(null);

      try {
        const payload: UpdateUserDTO = {
          ...extraData,
          role_id: User.role_id,
          occupation_id: User.occupation_id,
          dependency_id: User.dependency_id,
          institution_id: User.institution_id,
        };

        const response = await updateUser(User.id, payload);
        patchUser?.(User.id, extraData as any);

        addToast(response.message, "success");
        closeExtra();
        refreshUsers();
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Error al guardar datos";
        setExtraError(msg);
        addToast(msg, "danger");
      } finally {
        setIsExtraSubmitting(false);
      }
    },
    [addToast, closeExtra, refreshUsers],
  );

  const handleConfirmAction = useCallback(
    async (User: User | null, type: "ban" | "restore" | "delete" | null) => {
      if (!User || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banUser(User.id);
        } else if (type === "restore") {
          response = await restoreUser(User.id);
        } else if (type === "delete") {
          response = await forceDeleteUser(User.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshUsers();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshUsers],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importUsers(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshUsers();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshUsers();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshUsers],
  );

  return {
    isSubmitting,
    mutationError,
    resetMutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
    isExtraSubmitting,
    extraError,
    handleSaveExtra,
  };
}
