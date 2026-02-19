import { useState, useCallback } from "react";
import type { Unit } from "../units.types";

export function useUnitsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const openCreate = useCallback(() => {
    setEditingUnit(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((unit: Unit) => {
    setEditingUnit(unit);
    setIsFormOpen(true); 
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingUnit(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);

  const openView = useCallback((unit: Unit) => {
    setViewingUnit(unit);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingUnit(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionUnit, setActionUnit] = useState<Unit | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (unit: Unit, type: "ban" | "restore" | "delete") => {
      setActionUnit(unit);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionUnit(null);
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
    editingUnit,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingUnit,
    openView,
    closeView,

    isConfirmOpen,
    actionUnit,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
