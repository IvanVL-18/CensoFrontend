import { useState, useCallback } from "react";
import type { question } from "../Answers.types";
import { getquestion } from "../Answers.service"; 


export function usequestionsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingquestion, setEditingquestion] = useState<question | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const openPreview = useCallback(() => {
  setIsPreviewOpen(true);
}, []);

const closePreview = useCallback(() => {
  setIsPreviewOpen(false);
}, []);


  const openCreate = useCallback(() => {
    setEditingquestion(null);
    setIsFormOpen(true);
  }, []);

const openEdit = useCallback(async (question: question) => {
    setEditingquestion(question);
    setIsFormOpen(true);

    try {
      const fullquestion = await getquestion(question.id);
      setEditingquestion(fullquestion);
    } catch {
    }
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingquestion(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingquestion, setViewingquestion] = useState<question | null>(null);

  const openView = useCallback((question: question) => {
    setViewingquestion(question);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingquestion(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionquestion, setActionquestion] = useState<question | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const openConfirm = useCallback(
    (question: question, type: "ban" | "restore" | "delete") => {
      setActionquestion(question);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionquestion(null);
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
    editingquestion,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingquestion,
    openView,
    closeView,

    isConfirmOpen,
    actionquestion,
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
