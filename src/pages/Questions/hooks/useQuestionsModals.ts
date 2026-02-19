import { useState, useCallback } from "react";
import type { Question } from "../Questions.types";

export function useQuestionsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const openPreview = useCallback(() => {
  setIsPreviewOpen(true);
}, []);

const closePreview = useCallback(() => {
  setIsPreviewOpen(false);
}, []);


  const openCreate = useCallback(() => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((Question: Question) => {
    setEditingQuestion(Question);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingQuestion(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);

  const openView = useCallback((Question: Question) => {
    setViewingQuestion(Question);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingQuestion(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionQuestion, setActionQuestion] = useState<Question | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (Question: Question, type: "ban" | "restore" | "delete") => {
      setActionQuestion(Question);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionQuestion(null);
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
    editingQuestion,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingQuestion,
    openView,
    closeView,

    isConfirmOpen,
    actionQuestion,
    actionType,
    openConfirm,
    closeConfirm,

    isBulkErrorOpen,
    bulkErrors,
    openBulkError,
    closeBulkError,

    closePreview,
    openPreview,
    previewData,
    setPreviewData,
    isPreviewOpen,

  };
}
