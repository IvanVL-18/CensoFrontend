import { useState, useCallback } from "react";
import type { Section } from "../Sections.types";

export function useSectionsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const openCreate = useCallback(() => {
    setEditingSection(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Section: Section) => {
    setEditingSection(Section);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingSection(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingSection, setViewingSection] = useState<Section | null>(null);

  const openView = useCallback((Section: Section) => {
    setViewingSection(Section);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingSection(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionSection, setActionSection] = useState<Section | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Section: Section, type: "ban" | "restore" | "delete") => {
      setActionSection(Section);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionSection(null);
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
    editingSection,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingSection,
    openView,
    closeView,

    isConfirmOpen,
    actionSection,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,
  };
}
