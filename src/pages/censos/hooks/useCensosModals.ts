import { useState, useCallback } from "react";
import type { Censo } from "../Censos.types";

export function useCensosModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCenso, setEditingCenso] = useState<Censo | null>(null);

  const openCreate = useCallback(() => {
    setEditingCenso(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Censo: Censo) => {
    setEditingCenso(Censo);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCenso(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingCenso, setViewingCenso] = useState<Censo | null>(null);

  const openView = useCallback((Censo: Censo) => {
    setViewingCenso(Censo);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingCenso(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionCenso, setActionCenso] = useState<Censo | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Censo: Censo, type: "ban" | "restore" | "delete") => {
      setActionCenso(Censo);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionCenso(null);
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
    editingCenso,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingCenso,
    openView,
    closeView,

    isConfirmOpen,
    actionCenso,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
