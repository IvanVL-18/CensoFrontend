import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import {
  createCatalogItem,
  updateCatalogItem,
  banCatalogItem,
  restoreCatalogItem,
  forceDeleteCatalogItem,
} from "../CatalogItems.service";
import type { CatalogItem } from "../CatalogItems.types";

interface UseDependenciesMutationsProps {
  refreshDependencies: () => void;
  closeForm: () => void;
  closeConfirm: () => void;
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).flat()?.[0];
      if (typeof first === "string" && first.trim()) return first;
    }

    return err.message || "Error al procesar la solicitud";
  }

  if (err instanceof Error) return err.message;
  return "Error al procesar la solicitud";
}

export function useCatalogItemsMutations({
  refreshDependencies,
  closeForm,
  closeConfirm,
}: UseDependenciesMutationsProps) {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const handleSave = useCallback(
    async (
      value: string,
      label: string,
      catalogId: string,
      editingCatalogItem?: CatalogItem | null,
    ) => {
      setIsSubmitting(true);
      setMutationError(null);

      try {
        const catalogItemData = {
          value: value.trim(),
          label: label.trim(),
          catalog_id: catalogId,
        };

        const response = editingCatalogItem
          ? await updateCatalogItem(editingCatalogItem.id, catalogItemData)
          : await createCatalogItem(catalogItemData);

        addToast(response.message, "success");
        closeForm();
        refreshDependencies();
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeForm, refreshDependencies],
  );

  const handleConfirmAction = useCallback(
    async (
      catalogItem: CatalogItem | null,
      type: "ban" | "restore" | "delete" | null,
    ) => {
      if (!catalogItem || !type) return;

      setIsSubmitting(true);
      setMutationError(null);

      try {
        let response: { message: string } | undefined;

        if (type === "ban") response = await banCatalogItem(catalogItem.id);
        else if (type === "restore") response = await restoreCatalogItem(catalogItem.id);
        else if (type === "delete") response = await forceDeleteCatalogItem(catalogItem.id);

        if (response) {
          const toastType = type === "delete" ? "warning" : "success";
          addToast(response.message, toastType);
          closeConfirm();
          refreshDependencies();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setMutationError(msg);
        addToast(msg, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast, closeConfirm, refreshDependencies],
  );

  return {
    isSubmitting,
    mutationError,
    clearMutationError,
    handleSave,
    handleConfirmAction,
  };
}
