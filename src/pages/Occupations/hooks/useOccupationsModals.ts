import { useState, useCallback } from "react";
import type { Occupation } from "../Occupations.types";

export function useOccupationsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null);

  const openCreate = useCallback(() => {
    setEditingOccupation(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Occupation: Occupation) => {
    setEditingOccupation(Occupation);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingOccupation(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingOccupation, setViewingOccupation] = useState<Occupation | null>(null);

  const openView = useCallback((Occupation: Occupation) => {
    setViewingOccupation(Occupation);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingOccupation(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionOccupation, setActionOccupation] = useState<Occupation | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Occupation: Occupation, type: "ban" | "restore" | "delete") => {
      setActionOccupation(Occupation);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionOccupation(null);
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
    editingOccupation,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingOccupation,
    openView,
    closeView,

    isConfirmOpen,
    actionOccupation,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
