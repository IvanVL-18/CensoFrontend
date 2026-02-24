import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createModulo,
  updateModulo,
  banModulo,
  restoreModulo,
  forceDeleteModulo,
  importModulos,
} from "../Modulos.service";
import type { Modulo } from "../Modulos.types";

interface UseModulosMutationsProps {
  refreshModulos: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useModulosMutations({
  refreshModulos,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseModulosMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingModulo?: Modulo | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const ModuloData = { name };
        if (editingModulo) {
          response = await updateModulo(editingModulo.id, ModuloData);
        } else {
          response = await createModulo(ModuloData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshModulos();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshModulos],
  );

  const handleConfirmAction = useCallback(
    async (Modulo: Modulo | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Modulo || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banModulo(Modulo.id);
        } else if (type === "restore") {
          response = await restoreModulo(Modulo.id);
        } else if (type === "delete") {
          response = await forceDeleteModulo(Modulo.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshModulos();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshModulos],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importModulos(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshModulos();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshModulos();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false); 
      }
    },
    [addToast, openBulkError, refreshModulos],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
