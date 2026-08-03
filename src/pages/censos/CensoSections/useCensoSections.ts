import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCensoSections,
  searchCensoSectionIndexes,
  searchCensoSections,
  storeCensoSections,
  updateCensoSections,
} from "./CensoSections.service";
import type {
  CensusModuleInfo,
  SectionIndexOption,
  SectionInfo,
  SelectedSectionItem,
  CensoSectionRow,
  PaginationLinksObj,
} from "./CensoSections.types";
import { useToast } from "../../../context/ToastContext";

type SelectedSectionState = {
  section_id: string;
  index_id: string;
  index_name: string;
  stored_index_name: string | null;
  checked: boolean;
  census_section_id: string | null;
};

/**
 * Indexado por `section.key`, el identificador estable que manda el backend. Antes se usaba el
 * nombre de la sección, pero hay nombres repetidos ("Programa 1" existe 12 veces): todas las
 * homónimas compartían entrada, así que marcar una marcaba las demás y se guardaba una sola.
 */
type SelectedSectionsMap = Record<string, SelectedSectionState>;

// Ordena índices por segmentos numéricos ("1.10" va después de "1.9").
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

type UseCensoSectionsReturn = {
  moduleInfo: CensusModuleInfo | null;
  indexes: SectionIndexOption[];
  sections: SectionInfo[];
  rows: CensoSectionRow[];
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
  toggleSectionRow: (
    sectionKey: string,
    sectionId: string,
    checked: boolean,
  ) => void;
  toggleAllSectionRows: (checked: boolean) => void;
  selectIndex: (sectionKey: string, option: SectionIndexOption | null) => void;
  /** Busca índices asignables del subárbol del módulo; alimenta el combobox de cada fila. */
  searchIndexes: (
    term: string,
    signal: AbortSignal,
  ) => Promise<{ indexes: SectionIndexOption[]; hasMore: boolean }>;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
  goToPage: (page: number) => void;
};

export const useCensoSections = (
  censusModuleId: string,
): UseCensoSectionsReturn => {
  const { addToast } = useToast();
  const [moduleInfo, setModuleInfo] = useState<CensusModuleInfo | null>(null);
  const [indexes, setIndexes] = useState<SectionIndexOption[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
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

  const mapRef = useRef<SelectedSectionsMap>({});
  const [mapVersion, setMapVersion] = useState(0);
  const initialLoadDone = useRef(false);

  const updateMap = useCallback(
    (updater: (prev: SelectedSectionsMap) => SelectedSectionsMap) => {
      mapRef.current = updater(mapRef.current);
      setMapVersion((v) => v + 1);
    },
    [],
  );

  const buildInitialMap = useCallback(
    (
      selectedSections: SelectedSectionItem[],
      availableIndexes: SectionIndexOption[],
    ): SelectedSectionsMap => {
      const map: SelectedSectionsMap = {};

      selectedSections.forEach((item) => {
        const sectionKey = item.section?.key;
        if (!sectionKey) return;

        const matchedIndex = availableIndexes.find(
          (idx) =>
            idx.name.trim().toLowerCase() ===
            item.index?.name?.trim().toLowerCase(),
        );

        map[sectionKey] = {
          section_id: item.section?.id ?? "",
          index_id: matchedIndex
            ? String(matchedIndex.id)
            : (item.index?.id ?? ""),
          index_name: item.index?.name ?? "",
          stored_index_name: item.index?.name ?? null,
          checked: true,
          census_section_id: item.id ?? null,
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
          // Modo búsqueda: el backend solo devuelve las secciones filtradas.
          // Módulo, índices y mapa de selecciones se conservan tal cual.
          const data = await searchCensoSections(
            censusModuleId,
            debouncedSearch,
            page,
            signal,
          );
          if (signal?.aborted) return;

          setCurrentPage(data.sections?.current_page ?? 1);
          setLastPage(data.sections?.last_page ?? 1);
          setPaginationLinks({
            first: data.sections?.first_page_url ?? null,
            last: data.sections?.last_page_url ?? null,
            prev: data.sections?.prev_page_url ?? null,
            next: data.sections?.next_page_url ?? null,
          });
          setSections(data.sections?.data ?? []);
          return;
        }

        const data = await getCensoSections(censusModuleId, page, signal);

        if (signal?.aborted) return;

        const fetchedSections = data.sections?.data ?? [];
        const fetchedSelected = data.selectedSections ?? [];

        // El backend descarta de data.indexes los índices ya asignados al
        // módulo; se reincorporan desde selectedSections para poder resolver
        // y mostrar la asignación actual de cada sección (matching por nombre).
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
                section_id: backendEntry.section_id,
                index_id: backendEntry.index_id,
                census_section_id:
                  backendEntry.census_section_id ??
                  currentMap[key].census_section_id,
                stored_index_name:
                  backendEntry.stored_index_name ??
                  currentMap[key].stored_index_name,
              };
            }
          });

          mapRef.current = merged;
        }

        setMapVersion((v) => v + 1);
        setModuleInfo(data.censusModule);
        setIndexes(fetchedIndexes);
        setHasAssignments(fetchedSelected.length > 0);
        setCurrentPage(data.sections?.current_page ?? 1);
        setLastPage(data.sections?.last_page ?? 1);
        setPaginationLinks({
          first: data.sections?.first_page_url ?? null,
          last: data.sections?.last_page_url ?? null,
          prev: data.sections?.prev_page_url ?? null,
          next: data.sections?.next_page_url ?? null,
        });
        setSections(fetchedSections);
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
          setSections([]);
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
    [censusModuleId, buildInitialMap, debouncedSearch],
  );

  // Carga inicial y recarga (a página 1) cuando cambia la búsqueda con debounce
  useEffect(() => {
    const controller = new AbortController();
    void loadData(1, controller.signal, !initialLoadDone.current);
    return () => controller.abort();
  }, [loadData]);

  const rows = useMemo<CensoSectionRow[]>(() => {
    const map = mapRef.current;

    return sections.map((section) => {
      const sel = map[section.key];
      const isChecked = sel?.checked ?? false;
      const currentIndexId = isChecked ? (sel?.index_id ?? "") : "";

      return {
        key: section.key,
        section_id: section.id,
        section_name: section.name,
        checked: isChecked,
        selected_index_id: currentIndexId,
        stored_index_name: isChecked ? (sel?.stored_index_name ?? null) : null,
        census_section_id: isChecked ? (sel?.census_section_id ?? null) : null,
      };
    });
  }, [sections, indexes, mapVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const allChecked = useMemo(
    () => rows.length > 0 && rows.every((r) => r.checked),
    [rows],
  );

  // Índices ya elegidos en alguna sección (incluye las de otras páginas);
  // cada fila los oculta de su select, excepto el suyo propio.
  const usedIndexIds = useMemo(() => {
    return new Set(
      Object.values(mapRef.current)
        .filter((item) => item.checked && item.index_id)
        .map((item) => String(item.index_id)),
    );
  }, [mapVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSectionRow = useCallback(
    (sectionKey: string, sectionId: string, checked: boolean) => {
      updateMap((prev) => {
        const existing = prev[sectionKey];
        return {
          ...prev,
          [sectionKey]: {
            section_id: existing?.section_id ?? sectionId,
            index_id: existing?.index_id ?? "",
            index_name: existing?.index_name ?? "",
            stored_index_name: existing?.stored_index_name ?? null,
            census_section_id: existing?.census_section_id ?? null,
            checked,
          },
        };
      });
    },
    [updateMap],
  );

  const toggleAllSectionRows = useCallback(
    (checked: boolean) => {
      updateMap((prev) => {
        const next = { ...prev };
        sections.forEach((section) => {
          const existing = next[section.key];
          next[section.key] = {
            section_id: existing?.section_id ?? section.id,
            index_id: existing?.index_id ?? "",
            index_name: existing?.index_name ?? "",
            stored_index_name: existing?.stored_index_name ?? null,
            census_section_id: existing?.census_section_id ?? null,
            checked,
          };
        });
        return next;
      });
    },
    [sections, updateMap],
  );

  const searchIndexes = useCallback(
    async (term: string, signal: AbortSignal) => {
      const data = await searchCensoSectionIndexes(
        censusModuleId,
        term,
        signal,
      );
      return { indexes: data.indexes ?? [], hasMore: Boolean(data.hasMore) };
    },
    [censusModuleId],
  );

  const selectIndex = useCallback(
    (sectionKey: string, option: SectionIndexOption | null) => {
      /*
       * El índice puede venir del buscador y no estar en `indexes`, que solo trae los
       * hijos directos del módulo. Se registra para que la columna "Asignación actual"
       * pueda resolver su nombre.
       */
      if (option) {
        setIndexes((prev) =>
          prev.some((idx) => String(idx.id) === String(option.id))
            ? prev
            : [...prev, option].sort(compareIndexNames),
        );
      }

      updateMap((prev) => {
        if (!prev[sectionKey]) return prev;
        return {
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            index_id: option ? String(option.id) : "",
            index_name: option?.name ?? "",
          },
        };
      });
    },
    [updateMap],
  );

  const validItems = useMemo(
    () =>
      Object.values(mapRef.current).filter(
        (item) => item.checked && item.index_id,
      ),
    [mapVersion], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const saveChanges = useCallback(async () => {
    if (!censusModuleId) return false;



    try {
      setSaving(true);

      const result = hasAssignments
        ? await updateCensoSections(censusModuleId, {
            items: validItems.map((item) => ({
              census_section_id: item.census_section_id ?? null,
              index_id: item.index_id,
              section_id: item.section_id,
            })),
          })
        : await storeCensoSections({
            census_module_id: censusModuleId,
            items: validItems.map((item) => ({
              index_id: item.index_id,
              section_id: item.section_id,
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
      addToast(result.message ?? "Secciones guardadas correctamente.", "success");
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
  }, [censusModuleId, hasAssignments, validItems, loadData, currentPage]);

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
    moduleInfo,
    indexes,
    sections,
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
    toggleSectionRow,
    toggleAllSectionRows,
    selectIndex,
    searchIndexes,
    saveChanges,
    reload,
    goToPage,
  };
};
