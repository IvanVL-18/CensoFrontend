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
import type { User, CreateUserDTO, UpdateUserDTO, UserModalPayload } from "../Users.types";

interface UseUsersMutationsProps {
  refreshUsers: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;

  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export function useUsersMutations({
  refreshUsers,
  closeForm,
  closeConfirm,
  openBulkError,
  setUsers,
}: UseUsersMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (data: UserModalPayload, editingUser?: User | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        if (editingUser) {
          const payload: UpdateUserDTO = {
            email: data.email,
            role_id: data.role_id,
            ...(data.password.trim()
              ? {
                  password: data.password,
                  password_confirmation: data.password_confirmation,
                }
              : {}),
          };

          const res = await updateUser(editingUser.id, payload);
          addToast(res.message, "success");
        } else {
          const payload: CreateUserDTO = {
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            role_id: data.role_id,
          };

          const res = await createUser(payload);
          addToast(res.message, "success");
        }

        closeForm();
        refreshUsers(); 
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshUsers],
  );

  const handleConfirmAction = useCallback(
    async (userItem: User | null, type: "ban" | "restore" | "delete" | null) => {
      if (!userItem || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        if (type === "ban") {
          const res = await banUser(userItem.id);
          const now = new Date().toISOString();
          setUsers((prev) =>
            prev.map((u) => (u.id === userItem.id ? { ...u, deleted_at: now } : u)),
          );

          addToast(res.message, "success");
          closeConfirm();
          return;
        }

        if (type === "restore") {
          const res = await restoreUser(userItem.id);

          setUsers((prev) =>
            prev.map((u) => (u.id === userItem.id ? { ...u, deleted_at: null } : u)),
          );

          addToast(res.message, "success");
          closeConfirm();
          return;
        }

        if (type === "delete") {
          const res = await forceDeleteUser(userItem.id);
          setUsers((prev) => prev.filter((u) => u.id !== userItem.id));
          addToast(res.message, "warning");
          closeConfirm();
          return;
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al procesar la acción";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, setUsers],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await importUsers(formData);
        addToast(res.message || "Importación exitosa", "success");
        refreshUsers();
      } catch (err: any) {
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
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
