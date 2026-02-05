import { useState, useCallback } from "react";
import type { Section } from "../Sections.types";

export function useSectionsModals() {
  // Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const openCreate = useCallback(() => {
    setEditingSection(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((section: Section) => {
    setEditingSection(section);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingSection(null);
  }, []);

  // Ver Detalle
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingSection, setViewingSection] = useState<Section | null>(null);

  const openView = useCallback((section: Section) => {
    setViewingSection(section);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingSection(null);
  }, []);

  // Confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionSection, setActionSection] = useState<Section | null>(null);
  const [actionType, setActionType] = useState<"ban" | "restore" | "delete" | null>(null);

  const openConfirm = useCallback((section: Section, type: "ban" | "restore" | "delete") => {
    setActionSection(section);
    setActionType(type);
    setIsConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionSection(null);
    setActionType(null);
  }, []);

  // Errores Masivos
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
    isFormOpen, editingSection, openCreate, openEdit, closeForm,
    isViewOpen, viewingSection, openView, closeView,
    isConfirmOpen, actionSection, actionType, openConfirm, closeConfirm,
    isBulkErrorOpen, bulkErrors, openBulkError, closeBulkError,
  };
}