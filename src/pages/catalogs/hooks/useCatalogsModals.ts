import { useState, useCallback } from "react";
import type { Catalog } from "../Catalogs.types";

export function useCatalogsModals() {
  const [formState, setFormState] = useState({
    isOpen: false,
    catalog: null as Catalog | null,
  });

  const [viewState, setViewState] = useState({
    isOpen: false,
    catalog: null as Catalog | null,
  });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    catalog: Catalog | null;
    type: "ban" | "restore" | "delete" | null;
  }>({
    isOpen: false,
    catalog: null,
    type: null,
  });

  const [bulkErrorState, setBulkErrorState] = useState({
    isOpen: false,
    errors: [] as any[],
  });

  const openCreate = useCallback(() => {
    setFormState({ isOpen: true, catalog: null });
  }, []);

  // En useCatalogsModals.ts
const openEdit = useCallback((catalog: Catalog) => {
  // Asegurar que catalog tiene la estructura esperada
  setFormState({ 
    isOpen: true, 
    catalog: {
      ...catalog,
      unit_id: catalog.unit_id?.toString() || catalog.unit_id // Asegurar string
    } 
  });
}, []);

  const closeForm = useCallback(() => {
    setFormState({ isOpen: false, catalog: null });
  }, []);

  const openView = useCallback((catalog: Catalog) => {
    setViewState({ isOpen: true, catalog });
  }, []);

  const closeView = useCallback(() => {
    setViewState({ isOpen: false, catalog: null });
  }, []);

  const openConfirm = useCallback((catalog: Catalog, type: "ban" | "restore" | "delete") => {
    setConfirmState({ isOpen: true, catalog, type });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ isOpen: false, catalog: null, type: null });
  }, []);

  const openBulkError = useCallback((errors: any[]) => {
    setBulkErrorState({ isOpen: true, errors });
  }, []);

  const closeBulkError = useCallback(() => {
    setBulkErrorState({ isOpen: false, errors: [] });
  }, []);

  return {
    isFormOpen: formState.isOpen,
    editingCatalog: formState.catalog,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen: viewState.isOpen,
    viewingCatalog: viewState.catalog,
    openView,
    closeView,

    isConfirmOpen: confirmState.isOpen,
    actionCatalog: confirmState.catalog,
    actionType: confirmState.type,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen: bulkErrorState.isOpen,
    bulkErrors: bulkErrorState.errors,
    openBulkError,
    closeBulkError,
  };
}