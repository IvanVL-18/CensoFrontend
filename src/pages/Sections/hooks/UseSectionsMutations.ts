import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createsection,
  updatesection,
  bansection,
  restoresection,
  forceDeletesection,
  importSections,
} from "../Sections.service";
import type { section } from "../Sections.types";

interface UseSectionsMutationsProps {
  refreshSections: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useSectionsMutations({
  refreshSections,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseSectionsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingsection?: section | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const sectionData = { name };
        if (editingsection) {
          response = await updatesection(editingsection.id, sectionData);
        } else {
          response = await createsection(sectionData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshSections();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshSections],
  );

  const handleConfirmAction = useCallback(
    async (section: section | null, type: "ban" | "restore" | "delete" | null) => {
      if (!section || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await bansection(section.id);
        } else if (type === "restore") {
          response = await restoresection(section.id);
        } else if (type === "delete") {
          response = await forceDeletesection(section.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshSections();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshSections],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importSections(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshSections();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshSections();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshSections],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
