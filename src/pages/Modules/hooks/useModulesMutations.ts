import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createModule,
  updateModule,
  banModule,
  restoreModule,
  forceDeleteModule,
  importModules,
} from "../Modules.service";
import type { Module } from "../Modules.types";

interface UseModulesMutationsProps {
  refreshModules: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useModulesMutations({
  refreshModules,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseModulesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingModule?: Module | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const ModuleData = { name };
        if (editingModule) {
          response = await updateModule(editingModule.id, ModuleData);
        } else {
          response = await createModule(ModuleData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshModules();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshModules],
  );

  const handleConfirmAction = useCallback(
    async (Module: Module | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Module || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banModule(Module.id);
        } else if (type === "restore") {
          response = await restoreModule(Module.id);
        } else if (type === "delete") {
          response = await forceDeleteModule(Module.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshModules();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshModules],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importModules(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshModules();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshModules();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false); 
      }
    },
    [addToast, openBulkError, refreshModules],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
