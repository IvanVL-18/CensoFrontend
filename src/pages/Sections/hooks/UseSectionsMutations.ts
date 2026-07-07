import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createSection,
  updateSection,
  banSection,
  restoreSection,
  forceDeleteSection,
  importSections,
} from "../sections.service";
import type { Section, CreateSectionDTO } from "../Sections.types";

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
    async (sectionData: CreateSectionDTO, editingSection?: Section | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        if (editingSection) {
          response = await updateSection(editingSection.id, sectionData);
        } else {
          response = await createSection(sectionData);
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
    async (Section: Section | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Section || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banSection(Section.id);
        } else if (type === "restore") {
          response = await restoreSection(Section.id);
        } else if (type === "delete") {
          response = await forceDeleteSection(Section.id);
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
