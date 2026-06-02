import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCensusQuestions,
  storeCensusQuestions,
  updateCensusQuestions,
} from "./CensusQuestions.service";
import type {
  CensusSectionInfo,
  QuestionOption,
  QuestionIndexOption,
  SelectedQuestionItem,
  CensusQuestionRow,
  PaginationLinksObj,
} from "./CensusQuestions.types";
import { useToast } from "../../../context/ToastContext";



type SelectedQuestionState = {
  question_id: string;
  index_id: string;
  index_name: string;
  stored_index_name: string | null;
  checked: boolean;
  census_question_id: string | null;
};

type SelectedQuestionsMap = Record<string, SelectedQuestionState>;



type UseCensusQuestionsReturn = {
  sectionInfo: CensusSectionInfo | null;
  indexes: QuestionIndexOption[];
  questions: QuestionOption[];
  rows: CensusQuestionRow[];
  loading: boolean;
  paginating: boolean;
  saving: boolean;
  hasAssignments: boolean;
  allChecked: boolean;
  currentPage: number;
  lastPage: number;
  paginationLinks: PaginationLinksObj | null;
  toggleQuestionRow: (questionName: string, questionId: string, checked: boolean) => void;
  toggleAllQuestionRows: (checked: boolean) => void;
  changeIndex: (questionName: string, questionId: string, indexId: string) => void;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
  goToPage: (page: number) => void;
};



export const useCensusQuestions = (
  censusSectionId: string,
): UseCensusQuestionsReturn => {
  const [sectionInfo, setSectionInfo] = useState<CensusSectionInfo | null>(
    null,
  );
  const [indexes, setIndexes] = useState<QuestionIndexOption[]>([]);
  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paginating, setPaginating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasAssignments, setHasAssignments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationLinks, setPaginationLinks] =
    useState<PaginationLinksObj | null>(null);

  const mapRef = useRef<SelectedQuestionsMap>({});
  const [mapVersion, setMapVersion] = useState(0);
  const initialLoadDone = useRef(false);

  

  const updateMap = useCallback(
    (updater: (prev: SelectedQuestionsMap) => SelectedQuestionsMap) => {
      mapRef.current = updater(mapRef.current);
      setMapVersion((v) => v + 1);
    },
    [],
  );

  const buildInitialMap = useCallback(
    (
      selectedQuestions: SelectedQuestionItem[],
      availableIndexes: QuestionIndexOption[],
    ): SelectedQuestionsMap => {
      const map: SelectedQuestionsMap = {};

      selectedQuestions.forEach((item) => {
        const questionName = item.question?.name;
        if (!questionName) return;

        const matchedIndex = availableIndexes.find(
          (idx) =>
            idx.name.trim().toLowerCase() ===
            item.index?.name?.trim().toLowerCase(),
        );

        map[questionName] = {
          question_id: item.question?.id ?? "",
          index_id: matchedIndex
            ? String(matchedIndex.id)
            : (item.index?.id ?? ""),
          index_name: item.index?.name ?? "",
          stored_index_name: item.index?.name ?? null,
          checked: true,
          census_question_id: item.id ?? null,
        };
      });

      return map;
    },
    [],
  );

  

  const loadData = useCallback(
    async (page: number, signal?: AbortSignal, isInitial = false) => {
      try {
        isInitial ? setLoading(true) : setPaginating(true);

        const data = await getCensusQuestions(censusSectionId, page, signal);

        if (signal?.aborted) return;

        const fetchedIndexes = data.indexes ?? [];
        const fetchedQuestions = data.questions?.data ?? [];
        const fetchedSelected = data.selectedQuestions ?? [];

        const freshMap = buildInitialMap(fetchedSelected, fetchedIndexes);

        if (!initialLoadDone.current) {
          mapRef.current = freshMap;
          initialLoadDone.current = true;
        } else {
          const currentMap = mapRef.current;
          const merged = { ...currentMap };

          Object.entries(freshMap).forEach(([name, backendEntry]) => {
            if (!currentMap[name]) {
              merged[name] = backendEntry;
            } else {
              merged[name] = {
                ...currentMap[name],
                question_id: backendEntry.question_id,
                index_id: backendEntry.index_id,
                census_question_id:
                  backendEntry.census_question_id ??
                  currentMap[name].census_question_id,
                stored_index_name:
                  backendEntry.stored_index_name ??
                  currentMap[name].stored_index_name,
              };
            }
          });

          mapRef.current = merged;
        }

        setMapVersion((v) => v + 1);
        setSectionInfo(data.censusSection);
        setIndexes(fetchedIndexes);
        setHasAssignments(fetchedSelected.length > 0);
        setCurrentPage(data.questions?.current_page ?? 1);
        setLastPage(data.questions?.last_page ?? 1);
        setPaginationLinks({
          first: data.questions?.first_page_url ?? null,
          last: data.questions?.last_page_url ?? null,
          prev: data.questions?.prev_page_url ?? null,
          next: data.questions?.next_page_url ?? null,
        });
        setQuestions(fetchedQuestions);
      } catch (err: unknown) {
        const e = err as {
          name?: string;
          response?: { data?: { message?: string } };
        };
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        addToast(
          e?.response?.data?.message ?? "No se pudo cargar la información.",
          "danger",
        );
      } finally {
        setLoading(false);
        setPaginating(false);
      }
    },
    [censusSectionId, buildInitialMap],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(1, controller.signal, true);
    return () => controller.abort();
  }, [loadData]);

  

  const rows = useMemo<CensusQuestionRow[]>(() => {
    const map = mapRef.current;

    return questions.map((question) => {
      // Check by encrypted id first (toggled this session), then by name (pre-selected on load)
      const sel = map[question.id] ?? map[question.name];
      const isChecked = sel?.checked ?? false;
      const currentIndexId = isChecked ? (sel?.index_id ?? "") : "";

      return {
        question_id: question.id,
        question_name: question.name,
        checked: isChecked,
        selected_index_id: currentIndexId,
        stored_index_name: isChecked ? (sel?.stored_index_name ?? null) : null,
        census_question_id: isChecked
          ? (sel?.census_question_id ?? null)
          : null,
      };
    });
  }, [questions, indexes, mapVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const allChecked = useMemo(
    () => rows.length > 0 && rows.every((r) => r.checked),
    [rows],
  );

 

  const toggleQuestionRow = useCallback(
    (questionName: string, questionId: string, checked: boolean) => {
      updateMap((prev) => {
        // Prefer id-keyed entry; fall back to name-keyed (from initial load)
        const existing = prev[questionId] ?? prev[questionName];
        const next = { ...prev };
        // Migrate name-keyed entry to id-keyed to prevent duplicate-name selection bug
        if (next[questionName]) delete next[questionName];
        next[questionId] = {
          question_id: existing?.question_id ?? questionId,
          index_id: existing?.index_id ?? "",
          index_name: existing?.index_name ?? "",
          stored_index_name: existing?.stored_index_name ?? null,
          census_question_id: existing?.census_question_id ?? null,
          checked,
        };
        return next;
      });
    },
    [updateMap],
  );

  const toggleAllQuestionRows = useCallback(
    (checked: boolean) => {
      updateMap((prev) => {
        const next = { ...prev };
        questions.forEach((question) => {
          const existing = next[question.id] ?? next[question.name];
          if (next[question.name]) delete next[question.name];
          next[question.id] = {
            question_id: existing?.question_id ?? question.id,
            index_id: existing?.index_id ?? "",
            index_name: existing?.index_name ?? "",
            stored_index_name: existing?.stored_index_name ?? null,
            census_question_id: existing?.census_question_id ?? null,
            checked,
          };
        });
        return next;
      });
    },
    [questions, updateMap],
  );

  const changeIndex = useCallback(
    (questionName: string, questionId: string, indexId: string) => {
      updateMap((prev) => {
        const key = prev[questionId] ? questionId : prev[questionName] ? questionName : null;
        if (!key) return prev;
        const idxName =
          indexes.find((idx) => String(idx.id) === String(indexId))?.name ?? "";
        return {
          ...prev,
          [key]: { ...prev[key], index_id: indexId, index_name: idxName },
        };
      });
    },
    [updateMap, indexes],
  );

  const validItems = useMemo(
    () =>
      Object.values(mapRef.current).filter(
        (item) => item.checked && item.index_id,
      ),
    [mapVersion], 
  );

  const saveChanges = useCallback(async () => {
    if (!censusSectionId) return false;

    if (validItems.length === 0) {
      addToast("Selecciona al menos una pregunta y asígnale un índice.", "warning");
      return false;
    }

    try {
      setSaving(true);

    
      if (hasAssignments) {
        await updateCensusQuestions(censusSectionId, {
          items: validItems.map((item) => ({
            census_question_id: item.census_question_id ?? null,
            index_id: item.index_id,
            question_id: item.question_id,
          })),
        });
      } else {
        await storeCensusQuestions({
          census_section_id: censusSectionId,
          items: validItems.map((item) => ({
            index_id: item.index_id,
            question_id: item.question_id,
          })),
        });
      }

      mapRef.current = {};
      initialLoadDone.current = false;
      setMapVersion(0);
      await loadData(currentPage, undefined, false);
      addToast("Preguntas guardadas correctamente.", "success");
      return true;
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const apiError = e?.response?.data;
      if (apiError?.errors) {
        const firstKey = Object.keys(apiError.errors)[0];
        addToast(
          apiError.errors[firstKey]?.[0] ?? "No se pudieron guardar los cambios.",
          "danger",
        );
      } else {
        addToast(apiError?.message ?? "No se pudieron guardar los cambios.", "danger");
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, [censusSectionId, hasAssignments, validItems, loadData, currentPage]);

  const reload = useCallback(async () => {
    await loadData(currentPage, undefined, false);
  }, [loadData, currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > lastPage || page === currentPage) return;
      void loadData(page, undefined, false);
    },
    [lastPage, currentPage, loadData],
  );

  return {
    sectionInfo,
    indexes,
    questions,
    rows,
    loading,
    paginating,
    saving,
    hasAssignments,
    allChecked,
    currentPage,
    lastPage,
    paginationLinks,
    toggleQuestionRow,
    toggleAllQuestionRows,
    changeIndex,
    saveChanges,
    reload,
    goToPage,
  };
};