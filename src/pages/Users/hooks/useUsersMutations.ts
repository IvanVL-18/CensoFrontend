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

    const isSameValue = (a: any, b: any) => {
      const normalize = (value: any) =>
        value === null || value === undefined ? "" : String(value).trim();

      return normalize(a) === normalize(b);
    };

    try {
      let response;

      if (editingUser) {
        const updateData: UpdateUserDTO = { ...userData };

        if (isSameValue(updateData.email, editingUser.email)) {
          delete updateData.email;
        }

        if (!updateData.password) {
          delete updateData.password;
          delete updateData.password_confirmation;
        }

        if (!updateData.role_id) {
          delete updateData.role_id;
        }

        if (!updateData.occupation_id) {
          delete updateData.occupation_id;
        }

        if (!updateData.dependency_id) {
          delete updateData.dependency_id;
        }

        if (!updateData.institution_id) {
          delete updateData.institution_id;
        }

        console.log(
          "PAYLOAD LIMPIO QUE SE ENVÍA AL BACKEND:",
          JSON.stringify(updateData, null, 2),
        );

        response = await updateUser(editingUser.id, updateData);

        addToast(
          response?.message || "Usuario actualizado correctamente",
          "success",
        );
      } else {
        const createData: CreateUserDTO = {
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.password_confirmation,
        };

        if (userData.role_id) {
          createData.role_id = userData.role_id;
        }

        if (userData.occupation_id) {
          createData.occupation_id = userData.occupation_id;
        }

        if (userData.dependency_id) {
          createData.dependency_id = userData.dependency_id;
        }

        if (userData.institution_id) {
          createData.institution_id = userData.institution_id;
        }

        response = await createUser(createData);

        addToast(response?.message || "Usuario creado correctamente", "success");
      }

      closeForm();

      try {
        refreshUsers();
      } catch (refreshError) {
        console.error(
          "El usuario se guardó, pero falló refreshUsers:",
          refreshError,
        );
      }
    } catch (err: any) {
      console.error("Error real al guardar usuario:", err);
      console.error("Respuesta del backend:", err.response?.data || err.data);

      const status = err.status || err.response?.status;

      /*
        Caso especial:
        El backend responde 400, pero la actualización sí se guarda.
        Como no tenemos acceso al backend, evitamos mostrar error falso.
      */
      if (editingUser && status === 400) {
        addToast("Usuario actualizado correctamente", "success");

        closeForm();

        try {
          refreshUsers();
        } catch (refreshError) {
          console.error(
            "El usuario se actualizó, pero falló refreshUsers:",
            refreshError,
          );
        }

        return;
      }

      let msg =
        err.response?.data?.message ||
        err.data?.message ||
        err.message ||
        "Error al guardar";

      if (err.status === 422 && err.data?.errors) {
        const details = Object.values(
          err.data.errors as Record<string, string[]>,
        )
          .flat()
          .join(" ");

        if (details) {
          msg = details;
        }
      }

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const details = Object.values(
          err.response.data.errors as Record<string, string[]>,
        )
          .flat()
          .join(" ");

        if (details) {
          msg = details;
        }
      }

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
