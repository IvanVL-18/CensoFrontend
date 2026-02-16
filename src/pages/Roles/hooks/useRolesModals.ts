import { useState, useCallback } from "react";
import type { Rol } from "../Roles.types";

export function useRolesModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  const openCreate = useCallback(() => {
    setEditingRol(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Rol: Rol) => {
    setEditingRol(Rol);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRol(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);

  const openView = useCallback((Rol: Rol) => {
    setViewingRol(Rol);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingRol(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionRol, setActionRol] = useState<Rol | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Rol: Rol, type: "ban" | "restore" | "delete") => {
      setActionRol(Rol);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionRol(null);
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
    editingRol,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingRol,
    openView,
    closeView,

    isConfirmOpen,
    actionRol,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
