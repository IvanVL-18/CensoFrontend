import { useState, useCallback } from "react";
import type { Dependencia } from "../Dependencias.types";

export function useDependenciasModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDependencia, setEditingDependencia] = useState<Dependencia | null>(null);

  const openCreate = useCallback(() => {
    setEditingDependencia(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Dependencia: Dependencia) => {
    setEditingDependencia(Dependencia);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDependencia(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDependencia, setViewingDependencia] = useState<Dependencia | null>(null);

  const openView = useCallback((Dependencia: Dependencia) => {
    setViewingDependencia(Dependencia);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingDependencia(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionDependencia, setActionDependencia] = useState<Dependencia | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Dependencia: Dependencia, type: "ban" | "restore" | "delete") => {
      setActionDependencia(Dependencia);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionDependencia(null);
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
    editingDependencia,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingDependencia,
    openView,
    closeView,

    isConfirmOpen,
    actionDependencia,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
