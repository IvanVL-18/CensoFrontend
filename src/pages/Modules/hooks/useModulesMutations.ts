import { useState, useCallback } from "react";
import axios from "axios";
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

export function useModulesMutations({
  refreshModules,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseModulesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (name: string, editingModule?: Module | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const ModuleData = { name: name.trim() };

        const response = editingModule
          ? await updateModule(editingModule.id, ModuleData)
          : await createModule(ModuleData);

        addToast(response.message, "success");
        closeForm();
        refreshModules();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
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
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banModule(Module.id);
        else if (type === "restore") response = await restoreModule(Module.id);
        else if (type === "delete") response = await forceDeleteModule(Module.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshModules();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg); 
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshModules],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      setMutationError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importModules(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshModules();
      } catch (err: unknown) {
        console.error("Error en carga masiva:", err);

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data: any = err.response?.data;

          if (status === 422 && data?.errors) {
            openBulkError(data.errors);
            addToast("El archivo contiene errores que debes corregir", "warning");
            refreshModules();
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
    [addToast, openBulkError, refreshModules],
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
