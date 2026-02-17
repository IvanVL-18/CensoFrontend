import { useState, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  createCatalog,
  updateCatalog,
  banCatalog,
  restoreCatalog,
  forceDeleteCatalog,
  importCatalogs,
} from "../Catalogs.service";
import type { Catalog } from "../Catalogs.types";

interface UseCatalogsMutationsProps {
  refreshCatalogs: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
  openBulkError: (errors: any[]) => void;
}

export function useCatalogsMutations({
  refreshCatalogs,
  closeForm,
  closeConfirm,
  openBulkError,
}: UseCatalogsMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, slug: string, unitId: string, editingCatalog?: Catalog | null) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const catalogData = { name, slug, unit_id: unitId };
        const response = editingCatalog
          ? await updateCatalog(editingCatalog.id, catalogData)
          : await createCatalog(catalogData);

        if (response) {
          addToast(response.message, "success");
          closeForm();
          refreshCatalogs();
        }
      } catch (err: any) {
        const errors = err.response?.data?.errors;
        if (errors) {
          const validationErrors = Object.values(errors).flat().join(', ');
          setMutationError(validationErrors);
          addToast(validationErrors, "danger");
        } else {
          const msg = err.response?.data?.message || err.message || "Error al guardar";
          setMutationError(msg);
          addToast(msg, "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshCatalogs],
  );

  const handleConfirmAction = useCallback(
    async (catalog: Catalog | null, type: "ban" | "restore" | "delete" | null) => {
      if (!catalog || !type) return;

      setIsSubmitting(true);
      try {
        const actions = {
          ban: banCatalog,
          restore: restoreCatalog,
          delete: forceDeleteCatalog,
        };

        const response = await actions[type](catalog.id);
        
        if (response) {
          addToast(response.message, type === "delete" ? "warning" : "success");
          closeConfirm();
          refreshCatalogs();
        }
      } catch (err: any) {
        addToast(err.message || "Error al procesar la acción", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshCatalogs],
  );

  const handleBulkUpload = useCallback(
    async (file: File) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await importCatalogs(formData);
        addToast(response.message || "Importación exitosa", "success");
        refreshCatalogs();
      } catch (err: any) {
        if (err.status === 422 && err.data?.errors) {
          openBulkError(err.data.errors);
          addToast("El archivo contiene errores que debes corregir", "warning");
          refreshCatalogs();
        } else {
          addToast(err.message || "Error al subir el archivo", "danger");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, openBulkError, refreshCatalogs],
  );

  return {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  };
}