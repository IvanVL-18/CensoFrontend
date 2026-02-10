import { useState, useCallback } from "react";
import type { Index } from "../Indexs.types";

export function useIndexsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<Index | null>(null);

  const openCreate = useCallback(() => {
    setEditingIndex(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Index: Index) => {
    setEditingIndex(Index);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingIndex(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<Index | null>(null);

  const openView = useCallback((Index: Index) => {
    setViewingIndex(Index);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingIndex(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionIndex, setActionIndex] = useState<Index | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Index: Index, type: "ban" | "restore" | "delete") => {
      setActionIndex(Index);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionIndex(null);
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
    editingIndex,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingIndex,
    openView,
    closeView,

    isConfirmOpen,
    actionIndex,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
