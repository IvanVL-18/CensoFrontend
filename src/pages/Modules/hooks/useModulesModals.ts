import { useState, useCallback } from "react";
import type { Module } from "../Modules.types";

export function useModulesModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const openCreate = useCallback(() => {
    setEditingModule(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Module: Module) => {
    setEditingModule(Module);
    setIsFormOpen(true); 
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingModule(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);

  const openView = useCallback((Module: Module) => {
    setViewingModule(Module);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingModule(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionModule, setActionModule] = useState<Module | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Module: Module, type: "ban" | "restore" | "delete") => {
      setActionModule(Module);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionModule(null);
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
    editingModule,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingModule,
    openView,
    closeView,

    isConfirmOpen,
    actionModule,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
