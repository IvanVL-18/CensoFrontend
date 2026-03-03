import { useState, useCallback } from "react";
import type { Dependency } from "../Dependencies.types";

export function useDependenciesModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDependency, setEditingDependency] = useState<Dependency | null>(null);

  const openCreate = useCallback(() => {
    setEditingDependency(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Dependency: Dependency) => {
    setEditingDependency(Dependency);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDependency(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDependency, setViewingDependency] = useState<Dependency | null>(null);

  const openView = useCallback((Dependency: Dependency) => {
    setViewingDependency(Dependency);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingDependency(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionDependency, setActionDependency] = useState<Dependency | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Dependency: Dependency, type: "ban" | "restore" | "delete") => {
      setActionDependency(Dependency);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionDependency(null);
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
    editingDependency,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingDependency,
    openView,
    closeView,

    isConfirmOpen,
    actionDependency,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
