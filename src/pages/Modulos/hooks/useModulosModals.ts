import { useState, useCallback } from "react";
import type { Modulo } from "../Modulos.types";

export function useModulosModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);

  const openCreate = useCallback(() => {
    setEditingModulo(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Modulo: Modulo) => {
    setEditingModulo(Modulo);
    setIsFormOpen(true); 
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingModulo(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingModulo, setViewingModulo] = useState<Modulo | null>(null);

  const openView = useCallback((Modulo: Modulo) => {
    setViewingModulo(Modulo);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingModulo(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionModulo, setActionModulo] = useState<Modulo | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Modulo: Modulo, type: "ban" | "restore" | "delete") => {
      setActionModulo(Modulo);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionModulo(null);
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
    editingModulo,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingModulo,
    openView,
    closeView,

    isConfirmOpen,
    actionModulo,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
