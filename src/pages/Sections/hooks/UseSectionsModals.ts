import { useState, useCallback } from "react";
import type { section } from "../Sections.types";

export function useSectionsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingsection, setEditingsection] = useState<section | null>(null);

  const openCreate = useCallback(() => {
    setEditingsection(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((section: section) => {
    setEditingsection(section);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingsection(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingsection, setViewingsection] = useState<section | null>(null);

  const openView = useCallback((section: section) => {
    setViewingsection(section);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingsection(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionsection, setActionsection] = useState<section | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (section: section, type: "ban" | "restore" | "delete") => {
      setActionsection(section);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionsection(null);
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
    editingsection,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingsection,
    openView,
    closeView,

    isConfirmOpen,
    actionsection,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
