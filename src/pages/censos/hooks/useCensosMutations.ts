import { useCallback, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createCenso,
  updateCenso,
  banCenso,
  restoreCenso,
  forceDeleteCenso,
  importCensos,
} from "../Censos.service";
import type { Censo, CreateCensoDTO } from "../Censos.types";

interface UseCensosMutationsProps {
  refreshCensos: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useCensosMutations({
  refreshCensos,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseCensosMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (data: CreateCensoDTO, editingCenso?: Censo | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const response = editingCenso
          ? await updateCenso(editingCenso.id, data)
          : await createCenso(data);

        addToast(response.message, "success");
        closeForm();
        refreshCensos();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshCensos]
  );

  const handleConfirmAction = useCallback(
    async (censo: Censo | null, type: "ban" | "restore" | "delete" | null) => {
      if (!censo || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banCenso(censo.id);
        else if (type === "restore") response = await restoreCenso(censo.id);
        else if (type === "delete") response = await forceDeleteCenso(censo.id);

        if (response) {
          addToast(response.message, type === "delete" ? "warning" : "success");
          closeConfirm();
          refreshCensos();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshCensos]
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importCensos(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshCensos();
      } catch (err: any) {
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshCensos();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshCensos]
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}