import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCensusQuestions,
  searchCensusQuestions,
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

/**
 * Indexado por `question.key`, el identificador estable que manda el backend. Antes se usaba el
 * nombre de la pregunta, pero hay nombres repetidos (uno aparece 170 veces): todas las homónimas
 * compartían entrada, así que marcar una marcaba las demás y se guardaba una sola.
 */
type SelectedQuestionsMap = Record<string, SelectedQuestionState>;

// Ordena índices por segmentos numéricos ("1.1.10" va después de "1.1.9").
const compareIndexNames = (a: { name: string }, b: { name: string }) => {
  const partsA = a.name.split(".").map(Number);
  const partsB = b.name.split(".").map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const diff = (partsA[i] ?? -1) - (partsB[i] ?? -1);
    if (diff !== 0) return diff;
  }
  return 0;
};



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
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchError: string | null;
  usedIndexIds: Set<string>;
  toggleQuestionRow: (questionKey: string, questionId: string, checked: boolean) => void;
  toggleAllQuestionRows: (checked: boolean) => void;
  changeIndex: (questionKey: string, indexId: string) => void;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Error de validación del backend al buscar; se muestra en la tabla.
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce: espera 500ms después de dejar de escribir para buscar.
  // El backend exige mínimo 2 caracteres; con menos se muestra la lista completa.
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      setDebouncedSearch(trimmed.length >= 2 ? trimmed : "");
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        const questionKey = item.question?.key;
        if (!questionKey) return;

        const matchedIndex = availableIndexes.find(
          (idx) =>
            idx.name.trim().toLowerCase() ===
            item.index?.name?.trim().toLowerCase(),
        );

        map[questionKey] = {
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
        setSearchError(null);

        if (debouncedSearch) {
          // Modo búsqueda: el backend solo devuelve las preguntas filtradas.
          // Sección, índices y mapa de selecciones se conservan tal cual.
          const data = await searchCensusQuestions(
            censusSectionId,
            debouncedSearch,
            page,
            signal,
          );
          if (signal?.aborted) return;

          setCurrentPage(data.questions?.current_page ?? 1);
          setLastPage(data.questions?.last_page ?? 1);
          setPaginationLinks({
            first: data.questions?.first_page_url ?? null,
            last: data.questions?.last_page_url ?? null,
            prev: data.questions?.prev_page_url ?? null,
            next: data.questions?.next_page_url ?? null,
          });
          setQuestions(data.questions?.data ?? []);
          return;
        }

        const data = await getCensusQuestions(censusSectionId, page, signal);

        if (signal?.aborted) return;

        const fetchedQuestions = data.questions?.data ?? [];
        const fetchedSelected = data.selectedQuestions ?? [];

        // El backend descarta de data.indexes los índices ya asignados a la
        // sección; se reincorporan desde selectedQuestions para poder resolver
        // y mostrar la asignación actual de cada pregunta (matching por nombre).
        const availableIndexes = data.indexes ?? [];
        const assignedIndexes = fetchedSelected
          .map((item) => item.index)
          .filter(
            (assigned) =>
              assigned?.name &&
              !availableIndexes.some(
                (idx) =>
                  idx.name.trim().toLowerCase() ===
                  assigned.name.trim().toLowerCase(),
              ),
          );
        const fetchedIndexes = [...availableIndexes, ...assignedIndexes].sort(
          compareIndexNames,
        );

        const freshMap = buildInitialMap(fetchedSelected, fetchedIndexes);

        if (!initialLoadDone.current) {
          mapRef.current = freshMap;
          initialLoadDone.current = true;
        } else {
          const currentMap = mapRef.current;
          const merged = { ...currentMap };

          Object.entries(freshMap).forEach(([key, backendEntry]) => {
            if (!currentMap[key]) {
              merged[key] = backendEntry;
            } else {
              merged[key] = {
                ...currentMap[key],
                question_id: backendEntry.question_id,
                index_id: backendEntry.index_id,
                census_question_id:
                  backendEntry.census_question_id ??
                  currentMap[key].census_question_id,
                stored_index_name:
                  backendEntry.stored_index_name ??
                  currentMap[key].stored_index_name,
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
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        };
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;

        const apiError = e?.response?.data;
        const firstValidationError = apiError?.errors
          ? Object.values(apiError.errors)[0]?.[0]
          : undefined;

        if (debouncedSearch) {
          // Error al buscar: se muestra en el área de la tabla, no como toast.
          setSearchError(
            firstValidationError ??
              apiError?.message ??
              "No se pudo realizar la búsqueda.",
          );
          setQuestions([]);
        } else {
          addToast(
            apiError?.message ?? "No se pudo cargar la información.",
            "danger",
          );
        }
      } finally {
        setLoading(false);
        setPaginating(false);
      }
    },
    [censusSectionId, buildInitialMap, debouncedSearch],
  );

  // Carga inicial y recarga (a página 1) cuando cambia la búsqueda con debounce
  useEffect(() => {
    const controller = new AbortController();
    void loadData(1, controller.signal, !initialLoadDone.current);
    return () => controller.abort();
  }, [loadData]);

  

  const rows = useMemo<CensusQuestionRow[]>(() => {
    const map = mapRef.current;

    return questions.map((question) => {
      const sel = map[question.key];
      const isChecked = sel?.checked ?? false;
      const currentIndexId = isChecked ? (sel?.index_id ?? "") : "";

      return {
        key: question.key,
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

  // Índices ya elegidos en alguna pregunta (incluye las de otras páginas);
  // cada fila los oculta de su select, excepto el suyo propio.
  const usedIndexIds = useMemo(() => {
    return new Set(
      Object.values(mapRef.current)
        .filter((item) => item.checked && item.index_id)
        .map((item) => String(item.index_id)),
    );
  }, [mapVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleQuestionRow = useCallback(
    (questionKey: string, questionId: string, checked: boolean) => {
      updateMap((prev) => {
        const existing = prev[questionKey];
        return {
          ...prev,
          [questionKey]: {
            question_id: existing?.question_id ?? questionId,
            index_id: existing?.index_id ?? "",
            index_name: existing?.index_name ?? "",
            stored_index_name: existing?.stored_index_name ?? null,
            census_question_id: existing?.census_question_id ?? null,
            checked,
          },
        };
      });
    },
    [updateMap],
  );

  const toggleAllQuestionRows = useCallback(
    (checked: boolean) => {
      updateMap((prev) => {
        const next = { ...prev };
        questions.forEach((question) => {
          const existing = next[question.key];
          next[question.key] = {
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
    (questionKey: string, indexId: string) => {
      updateMap((prev) => {
        if (!prev[questionKey]) return prev;
        const idxName =
          indexes.find((idx) => String(idx.id) === String(indexId))?.name ?? "";
        return {
          ...prev,
          [questionKey]: {
            ...prev[questionKey],
            index_id: indexId,
            index_name: idxName,
          },
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



    try {
      setSaving(true);

    
      const result = hasAssignments
        ? await updateCensusQuestions(censusSectionId, {
            items: validItems.map((item) => ({
              census_question_id: item.census_question_id ?? null,
              index_id: item.index_id,
              question_id: item.question_id,
            })),
          })
        : await storeCensusQuestions({
            census_section_id: censusSectionId,
            items: validItems.map((item) => ({
              index_id: item.index_id,
              question_id: item.question_id,
            })),
          });

      mapRef.current = {};
      initialLoadDone.current = false;
      setMapVersion(0);
      if (debouncedSearch) {
        // Se limpia la búsqueda: el mapa debe reconstruirse desde show, que es
        // el único endpoint que devuelve las asignaciones completas;
        // el efecto de carga recargará al cambiar debouncedSearch.
        setSearchTerm("");
        setDebouncedSearch("");
      } else {
        await loadData(currentPage, undefined, false);
      }
      addToast(result.message ?? "Preguntas guardadas correctamente.", "success");
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
  }, [censusSectionId, hasAssignments, validItems, loadData, currentPage, debouncedSearch]);

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
    searchTerm,
    setSearchTerm,
    searchError,
    usedIndexIds,
    toggleQuestionRow,
    toggleAllQuestionRows,
    changeIndex,
    saveChanges,
    reload,
    goToPage,
  };
};