import { useState, useCallback } from "react";
import type { User } from "../Users.types";

export function useUsersModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((User: User) => {
    setEditingUser(User);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingUser(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const openView = useCallback((User: User) => {
    setViewingUser(User);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingUser(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (User: User, type: "ban" | "restore" | "delete") => {
      setActionUser(User);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionUser(null);
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

  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const [extraUser, setExtraUser] = useState<User | null>(null);

  const openExtra = useCallback((User: User) => {
    setExtraUser(User);
    setIsExtraOpen(true);
  }, []);

  const closeExtra = useCallback(() => {
    setIsExtraOpen(false);
    setExtraUser(null);
  }, []);

  const patchUser = useCallback((id: string | number, patch: Partial<User>) => {
  const sid = String(id);

  setEditingUser((prev) =>
    prev && String(prev.id) === sid ? { ...prev, ...patch } : prev
  );

  setViewingUser((prev) =>
    prev && String(prev.id) === sid ? { ...prev, ...patch } : prev
  );

  setExtraUser((prev) =>
    prev && String(prev.id) === sid ? { ...prev, ...patch } : prev
  );
}, []);

  return {
    isFormOpen,
    editingUser,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingUser,
    openView,
    closeView,

    isConfirmOpen,
    actionUser,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,

    isExtraOpen,
    extraUser,
    openExtra,
    closeExtra,
    patchUser,
  };
}
