import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createSection,
  updateSection,
  deleteSection,
  restoreSection,
  forceDeleteSection,
  importSections,
} from "../sections.service";
import type { Section } from "../Sections.types";

import type { SectionFormData } from "../schemas/Sections.schema";

interface UseSectionMutationsProps {
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
}: UseSectionMutationsProps) {
  
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (data: SectionFormData, editingSection?: Section | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const payload = {
          name: data.name,
          instructions: data.instructions || null, 
        };

        if (editingSection) {
          response = await updateSection(editingSection.id, payload);
        } else {
          response = await createSection(payload);
        }

        addToast(response.message, "success");
        closeForm();
        refreshSections();
      } catch (err: any) {
        console.error("Error save:", err);
        let msg = "Error al guardar";

        if (err.response?.status === 422 && err.response?.data?.errors) {
          const errors = err.response.data.errors;
                    if (errors.instructions) {
            msg = `Instrucción duplicada: ${errors.instructions[0]}`;
          } else if (errors.name) {
            msg = `Error en nombre: ${errors.name[0]}`;
          } else {
            msg = Object.values(errors).flat().join(", ");
          }
        } 
        else if (err.response?.data?.message) {
          msg = err.response.data.message;
        }

        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshSections]
  );

  const handleConfirmAction = useCallback(
    async (section: Section | null, type: "ban" | "restore" | "delete" | null) => {
      if (!section || !type) return;

      setIsSubmitting(true);
      try {
        let response;
        if (type === "ban") response = await deleteSection(section.id);
        else if (type === "restore") response = await restoreSection(section.id);
        else if (type === "delete") response = await forceDeleteSection(section.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshSections();
        }
      } catch (err: any) {
        addToast(err.message || "Error en la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshSections]
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
          addToast("Errores en el archivo", "warning");
          refreshSections();
        } else {
          addToast(err.message || "Error al subir", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshSections]
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}