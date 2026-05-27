import { useState, useCallback } from "react";
import type { Indicator } from "../Indicators.types";

export function useIndicatorsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingIndicator(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Indicator: Indicator) => {
    setEditingIndicator(Indicator);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingIndicator(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingIndicator, setViewingIndicator] = useState<Indicator | null>(
    null,
  );

  const openView = useCallback((Indicator: Indicator) => {
    setViewingIndicator(Indicator);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingIndicator(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionIndicator, setActionIndicator] = useState<Indicator | null>(
    null,
  );
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Indicator: Indicator, type: "ban" | "restore" | "delete") => {
      setActionIndicator(Indicator);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionIndicator(null);
    setActionType(null);
  }, []);

  const [isBulkErrorOpen, setIsBulkErrorOpen] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<any[]>([]);

  const openBulkError = useCallback((errors: any[]) => {
    setBulkErrors(errors);
    setIsBulkErrorOpen(true);
  }, []);

  const closeBulkError = useCallback(() => {
    setIsBulkErrorOpen(false);
    setBulkErrors([]);
  }, []);

  return {
    isFormOpen,
    editingIndicator,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingIndicator,
    openView,
    closeView,

    isConfirmOpen,
    actionIndicator,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
