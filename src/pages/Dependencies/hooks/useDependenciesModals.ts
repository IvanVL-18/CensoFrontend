import { useState, useCallback } from "react";
import type { Dependencie } from "../Dependencies.types";

export function useDependenciesModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDependencie, setEditingDependencie] = useState<Dependencie | null>(null);

  const openCreate = useCallback(() => {
    setEditingDependencie(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Dependencie: Dependencie) => {
    setEditingDependencie(Dependencie);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDependencie(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDependencie, setViewingDependencie] = useState<Dependencie | null>(null);

  const openView = useCallback((Dependencie: Dependencie) => {
    setViewingDependencie(Dependencie);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingDependencie(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionDependencie, setActionDependencie] = useState<Dependencie | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Dependencie: Dependencie, type: "ban" | "restore" | "delete") => {
      setActionDependencie(Dependencie);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionDependencie(null);
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
    editingDependencie,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingDependencie,
    openView,
    closeView,

    isConfirmOpen,
    actionDependencie,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
