import { useState, useCallback } from "react";
import type { Area } from "../Areas.types";

export function useAreasModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const openCreate = useCallback(() => {
    setEditingArea(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Area: Area) => {
    setEditingArea(Area);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingArea(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingArea, setViewingArea] = useState<Area | null>(null);

  const openView = useCallback((Area: Area) => {
    setViewingArea(Area);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingArea(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionArea, setActionArea] = useState<Area | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Area: Area, type: "ban" | "restore" | "delete") => {
      setActionArea(Area);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionArea(null);
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
    editingArea,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingArea,
    openView,
    closeView,

    isConfirmOpen,
    actionArea,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
