import { useState, useCallback } from "react";
import type { Category } from "../Categories.types";

export function useCategoriesModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openCreate = useCallback(() => {
    setEditingCategory(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Category: Category) => {
    setEditingCategory(Category);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCategory(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const openView = useCallback((Category: Category) => {
    setViewingCategory(Category);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingCategory(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionCategory, setActionCategory] = useState<Category | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Category: Category, type: "ban" | "restore" | "delete") => {
      setActionCategory(Category);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionCategory(null);
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
    editingCategory,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingCategory,
    openView,
    closeView,

    isConfirmOpen,
    actionCategory,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
