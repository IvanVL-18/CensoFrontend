import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCensoSections,
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

type SelectedSectionState = {
  section_id: string;
  section_for_censo_id?: string;
  index_id: string;
  index_name: string;
  stored_index_name: string | null;
  checked: boolean;
  census_section_id: string | null;
};

type SelectedSectionsMap = Record<string, SelectedSectionState>;

type UseCensoSectionsReturn = {
  moduleInfo: CensusModuleInfo | null;
  indexes: SectionIndexOption[];
  sections: SectionInfo[];
  rows: CensoSectionRow[];
  loading: boolean;
  paginating: boolean;
  saving: boolean;
  error: string | null;
  hasAssignments: boolean;
  allChecked: boolean;
  currentPage: number;
  lastPage: number;
  paginationLinks: PaginationLinksObj | null;
  toggleSectionRow: (
    sectionName: string,
    sectionId: string,
    checked: boolean,
  ) => void;
  toggleAllSectionRows: (checked: boolean) => void;
  changeIndex: (sectionName: string, indexId: string) => void;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
  goToPage: (page: number) => void;
};

const PAGE_SIZE = 10;

export const useCensoSections = (
  censusModuleId: string,
): UseCensoSectionsReturn => {
  const [moduleInfo, setModuleInfo] = useState<CensusModuleInfo | null>(null);
  const [indexes, setIndexes] = useState<SectionIndexOption[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginating, setPaginating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssignments, setHasAssignments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationLinks, setPaginationLinks] =
    useState<PaginationLinksObj | null>(null);

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
        const sectionName = item.section?.name ?? "";
        const sectionId = item.section?.section_id ?? "";
        const sectionForCensoId = item.section_for_censo_id;
        if (!sectionName) return;

        const matchedIndex = availableIndexes.find(
          (idx) =>
            idx.name.trim().toLowerCase() ===
            item.index?.name?.trim().toLowerCase(),
        );

        map[sectionName] = {
          section_id: sectionId,
          section_for_censo_id: sectionForCensoId,
          index_id: matchedIndex ? String(matchedIndex.id) : "",
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
        setError(null);

        const data = await getCensoSections(censusModuleId, page, signal);

        if (signal?.aborted) return;

        const fetchedIndexes = data.indexes ?? [];
        const fetchedSections = data.sections?.data ?? [];
        const fetchedSelected = data.selectedSections ?? [];

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
                section_id: backendEntry.section_id,
                index_id: backendEntry.index_id,
                index_name: backendEntry.index_name,
                census_section_id:
                  backendEntry.census_section_id ??
                  currentMap[name].census_section_id,
                stored_index_name:
                  backendEntry.stored_index_name ??
                  currentMap[name].stored_index_name,
                section_for_censo_id:
                  backendEntry.section_for_censo_id ??
                  currentMap[name].section_for_censo_id,
                checked: true,
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
          response?: { data?: { message?: string } };
        };
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setError(
          e?.response?.data?.message ?? "No se pudo cargar la información.",
        );
      } finally {
        setLoading(false);
        setPaginating(false);
      }
    },
    [censusModuleId, buildInitialMap],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(1, controller.signal, true);
    return () => controller.abort();
  }, [loadData]);

  const rows = useMemo<CensoSectionRow[]>(() => {
    const map = mapRef.current;
    return sections.map((section) => {
      const sel = map[section.name];
      return {
        section_id: section.id,
        section_name: section.name,
        checked: sel?.checked ?? false,
        selected_index_id: sel?.index_id ?? "",
        stored_index_name: sel?.stored_index_name ?? null,
        section_for_censo_id: sel?.section_for_censo_id,
      };
    });
  }, [sections, mapVersion]);

  const allChecked = useMemo(
    () => rows.length > 0 && rows.every((r) => r.checked),
    [rows],
  );

  const toggleSectionRow = useCallback(
    (sectionName: string, sectionId: string, checked: boolean) => {
      updateMap((prev) => {
        const key = sectionName.replace(/\s+/g, " ").trim();
        const existing = prev[key];
        return {
          ...prev,
          [key]: {
            section_id: existing?.section_id ?? sectionId,
            index_id: existing?.index_id ?? "",
            index_name: existing?.index_name ?? "",
            stored_index_name: existing?.stored_index_name ?? null,
            census_section_id: existing?.census_section_id ?? null,
            section_for_censo_id: existing?.section_for_censo_id,
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
          const key = section.name.replace(/\s+/g, " ").trim();
          const existing = next[key];
          next[key] = {
            section_id: existing?.section_id ?? section.id,
            index_id: existing?.index_id ?? "",
            index_name: existing?.index_name ?? "",
            stored_index_name: existing?.stored_index_name ?? null,
            census_section_id: existing?.census_section_id ?? null,
            section_for_censo_id: existing?.section_for_censo_id,
            checked,
          };
        });
        return next;
      });
    },
    [sections, updateMap],
  );

  const changeIndex = useCallback(
    (sectionName: string, indexId: string) => {
      updateMap((prev) => {
        const key = sectionName.replace(/\s+/g, " ").trim();
        if (!prev[key]) return prev;
        const idxName =
          indexes.find((idx) => String(idx.id) === String(indexId))?.name ?? "";
        return {
          ...prev,
          [key]: {
            ...prev[key],
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
    if (!censusModuleId) return false;

    if (validItems.length === 0) {
      setError("Selecciona al menos una sección y asígnale un índice.");
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      if (hasAssignments) {
        await updateCensoSections(censusModuleId, {
          items: validItems.map((item) => ({
            census_section_id: item.census_section_id ?? null,
            index_id: item.index_id,
            section_id: item.section_id,
          })),
        });
      } else {
        await storeCensoSections({
          census_module_id: censusModuleId,
          items: validItems.map((item) => ({
            index_id: item.index_id,
            section_id: item.section_id,
          })),
        });
      }

      mapRef.current = {};
      initialLoadDone.current = false;
      setMapVersion(0);
      await loadData(currentPage, undefined, false);
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
        setError(
          apiError.errors[firstKey]?.[0] ??
            "No se pudieron guardar los cambios.",
        );
      } else {
        setError(apiError?.message ?? "No se pudieron guardar los cambios.");
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
    error,
    hasAssignments,
    allChecked,
    currentPage,
    lastPage,
    paginationLinks,
    toggleSectionRow,
    toggleAllSectionRows,
    changeIndex,
    saveChanges,
    reload,
    goToPage,
  };
};