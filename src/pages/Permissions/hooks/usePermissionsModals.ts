import { useState, useCallback } from "react";
import type { Permission } from "../Permissions.types";

export function usePermissionsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const openCreate = useCallback(() => {
    setEditingPermission(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Permission: Permission) => {
    setEditingPermission(Permission);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingPermission(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingPermission, setViewingPermission] = useState<Permission | null>(null);

  const openView = useCallback((Permission: Permission) => {
    setViewingPermission(Permission);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingPermission(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionPermission, setActionPermission] = useState<Permission | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Permission: Permission, type: "ban" | "restore" | "delete") => {
      setActionPermission(Permission);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionPermission(null);
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
    editingPermission,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingPermission,
    openView,
    closeView,

    isConfirmOpen,
    actionPermission,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
