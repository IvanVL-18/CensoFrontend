import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createCategory,
  updateCategory,
  banCategory,
  restoreCategory,
  forceDeleteCategory,
  importCategories,
} from "../Categories.service";
import type { Category } from "../Categories.types";

interface UseCategoriesMutationsProps {
  refreshCategories: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useCategoriesMutations({
  refreshCategories,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseCategoriesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, editingCategory?: Category | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response;
        const CategoryData = { name };
        if (editingCategory) {
          response = await updateCategory(editingCategory.id, CategoryData);
        } else {
          response = await createCategory(CategoryData);
        }

        addToast(response.message, "success");
        closeForm();
        refreshCategories();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Error al guardar";
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshCategories],
  );

  const handleConfirmAction = useCallback(
    async (Category: Category | null, type: "ban" | "restore" | "delete" | null) => {
      if (!Category || !type) return;

      setIsSubmitting(true);
      try {
        let response: { message: string } | undefined;

        if (type === "ban") {
          response = await banCategory(Category.id);
        } else if (type === "restore") {
          response = await restoreCategory(Category.id);
        } else if (type === "delete") {
          response = await forceDeleteCategory(Category.id);
        }

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshCategories();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshCategories],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importCategories(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshCategories();
      } catch (err: any) {
        console.error("Error en carga masiva:", err);
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshCategories();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshCategories],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}
