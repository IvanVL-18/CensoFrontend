import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import {
  getQuestions,
  getQuestionsByUrl,
  createQuestion,
  updateQuestion,
  banQuestion,
  restoreQuestion,
  forceDeleteQuestion,
  getQuestion,
} from "./questions.service";

import { useToast } from "../../context/ToastContext";

import type {
  Question,
  PaginatedQuestionsResponse,
  Meta,
  CreateQuestionDTO,
  QuestionFilter,
  SortConfig,
} from "./questions.interfaces";

export function useQuestions() {
  const { addToast } = useToast();

  const [isViewLoading, setIsViewLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [links, setLinks] = useState<PaginatedQuestionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingQuestion(null);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [reloadToken, setReloadToken] = useState(0);
  const reloadQuestions = useCallback(() => setReloadToken((t) => t + 1), []);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionQuestion, setActionQuestion] = useState<Question | null>(null);
  const [actionType, setActionType] = useState<"ban" | "restore" | "delete" | null>(null);

  useEffect(() => {
    setLoading(true);
    getQuestions(filter)
      .then((response) => {
        setQuestions(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Preguntas: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [filter, reloadToken]);

  const loadQuestionsByUrl = useCallback((url: string) => {
    setLoading(true);
    getQuestionsByUrl(url)
      .then((response) => {
        setQuestions(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar la página: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as QuestionFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) loadQuestionsByUrl(url);
    },
    [loadQuestionsByUrl]
  );

  const handleSort = useCallback((key: keyof Question) => {
    setSortConfig((current) => {
      let direction: "ascending" | "descending" = "ascending";
      if (current.key === key && current.direction === "ascending") direction = "descending";
      return { key, direction };
    });
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => q.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [questions, searchTerm]);

  const sortedQuestions = useMemo(() => {
    const sortable = [...filteredQuestions];
    sortable.sort((a, b) => {
      const valA = a[sortConfig.key] as any;
      const valB = b[sortConfig.key] as any;
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredQuestions, sortConfig]);

  const handleAddClick = useCallback(() => {
    setEditingQuestion(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null);
    setEditingQuestion(null);
  }, []);

  const handleModalSave = useCallback(
    async (payload: CreateQuestionDTO) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        let response: any;

        if (editingQuestion) {
          response = await updateQuestion(editingQuestion.id, payload);
        } else {
          response = await createQuestion(payload);
        }

        addToast(response.message, "success");
        setIsModalOpen(false);
        setEditingQuestion(null);
        reloadQuestions();
      } catch (err: any) {
        setModalError(err.message || "Ocurrió un error");
        addToast(err.message || "Ocurrió un error", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingQuestion, reloadQuestions, addToast]
  );

  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionQuestion(null);
    setActionType(null);
    setModalError(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!actionQuestion || !actionType) return;
    setIsSubmitting(true);

    try {
      let response: any;

      if (actionType === "ban") response = await banQuestion(actionQuestion.id);
      if (actionType === "restore") response = await restoreQuestion(actionQuestion.id);
      if (actionType === "delete") response = await forceDeleteQuestion(actionQuestion.id);

      if (response) {
        const toastType =
          actionType === "ban" ? "warning" : actionType === "delete" ? "danger" : "success";

        handleConfirmModalClose();
        reloadQuestions();
        addToast(response.message, toastType);
      }
    } catch (err: any) {
      addToast(err.message || "Error al procesar la acción", "danger");
    } finally {
      setIsSubmitting(false);
    }
  }, [actionQuestion, actionType, reloadQuestions, handleConfirmModalClose, addToast]);

  const onView = useCallback(
    async (question: Question) => {
      setIsViewLoading(true);
      try {
        const data = await getQuestion(question.id);
        setViewingQuestion(data);
        setIsViewModalOpen(true);
      } catch (err) {
        console.error("Error al obtener detalle:", err);
        const msg = (err as Error).message || "No se pudo cargar el detalle.";
        addToast(msg, "danger");
      } finally {
        setIsViewLoading(false);
      }
    },
    [addToast]
  );

  const onEdit = useCallback(
    async (question: Question) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        const detail = await getQuestion(question.id);
        setEditingQuestion(detail);
        setIsModalOpen(true);
      } catch (err: any) {
        addToast(err.message || "No se pudo cargar la pregunta.", "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [addToast]
  );

  const onBan = useCallback((question: Question) => {
    setActionQuestion(question);
    setActionType("ban");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onRestore = useCallback((question: Question) => {
    setActionQuestion(question);
    setActionType("restore");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((question: Question) => {
    setActionQuestion(question);
    setActionType("delete");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  return {
    loading,
    isViewLoading,
    error,

    sortedQuestions,
    meta,
    links,

    filter,
    searchTerm,

    isConfirmModalOpen,
    actionQuestion,
    actionType,

    isModalOpen,
    isSubmitting,
    modalError,
    editingQuestion,

    isViewModalOpen,
    viewingQuestion,

    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,

    handleAddClick,
    handleModalClose,
    handleModalSave,

    onView,
    onEdit,
    onBan,
    onRestore,
    onDelete,

    handleConfirmModalClose,
    handleConfirmAction,
    handleViewModalClose,
  };
}
