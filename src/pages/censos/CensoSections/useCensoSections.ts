import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCensoSections,
  storeCensoSections,
  updateCensoSections,
} from "./CensoSections.service";
import type {
  ModuleSectionInfo,
  SectionIndexOption,
  SectionInfo,
  SelectedSectionItem,
  CensoSectionRow,
  PaginationLinksObj,
} from "./CensoSections.types";

type SelectedSectionState = {
  section_id: string;
  index_id: string;
  stored_index_name: string | null;
};

type SelectedSectionsMap = Record<string, SelectedSectionState>;

type UseCensoSectionsReturn = {
  moduleInfo: ModuleSectionInfo | null;
  indexs: SectionIndexOption[];
  sections: SectionInfo[];
  rows: CensoSectionRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasAssignments: boolean;
  allChecked: boolean;
  currentPage: number;
  lastPage: number;
  paginationLinks: PaginationLinksObj | null;
  toggleSectionRow: (sectionId: string, checked: boolean) => void;
  toggleAllSectionRows: (checked: boolean) => void;
  changeIndex: (sectionId: string, indexId: string) => void;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
};

export const useCensoSections = (
  moduleForCensoId: string,
): UseCensoSectionsReturn => {
  const [moduleInfo, setModuleInfo] = useState<ModuleSectionInfo | null>(null);
  const [indexs, setIndexs] = useState<SectionIndexOption[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [rows, setRows] = useState<CensoSectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssignments, setHasAssignments] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [paginationLinks, setPaginationLinks] =
    useState<PaginationLinksObj | null>(null);

  const [selectedMap, setSelectedMap] = useState<SelectedSectionsMap>({});
  const selectedMapRef = useRef<SelectedSectionsMap>({});
  const [initializedSelection, setInitializedSelection] = useState(false);

  useEffect(() => {
    selectedMapRef.current = selectedMap;
  }, [selectedMap]);

  const buildInitialSelectedMap = useCallback(
    (
      selectedSections: SelectedSectionItem[] = [],
      availableIndexes: SectionIndexOption[] = [],
    ): SelectedSectionsMap => {
      const map: SelectedSectionsMap = {};

      selectedSections.forEach((item) => {
        const sectionId = String(item.reference?.id ?? "");
        if (!sectionId) return;

        const matchedIndex = availableIndexes.find(
          (index) => String(index.id) === String(item.index?.id),
        );

        map[sectionId] = {
          section_id: sectionId,
          index_id: matchedIndex ? String(matchedIndex.id) : "",
          stored_index_name: item.index?.name ?? null,
        };
      });

      return map;
    },
    [],
  );

  const buildRows = useCallback(
    (
      allSections: SectionInfo[],
      currentSelectedMap: SelectedSectionsMap,
    ): CensoSectionRow[] => {
      return allSections.map((section) => {
        const sectionId = String(section.id);
        const fromMap = currentSelectedMap[sectionId];

        return {
          section_id: sectionId,
          section_name: section.name,
          checked: Boolean(fromMap),
          selected_index_id: fromMap?.index_id ?? "",
          stored_index_name: fromMap?.stored_index_name ?? null,
        };
      });
    },
    [],
  );

  const loadData = useCallback(
    async (page: number = 1, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getCensoSections(moduleForCensoId, page, signal);
        const fetchedIndexs = data.indexs ?? [];
        const paginatedSections = data.sections;
        const fetchedSections = paginatedSections?.data ?? [];
        const fetchedSelected = data.sectionsSelected ?? [];

        setModuleInfo(data.module);
        setIndexs(fetchedIndexs);
        setSections(fetchedSections);
        setHasAssignments(Boolean(fetchedSelected.length));

        setCurrentPage(paginatedSections?.current_page ?? 1);
        setLastPage(paginatedSections?.last_page ?? 1);
        setPaginationLinks({
          first: paginatedSections?.first_page_url ?? null,
          last: paginatedSections?.last_page_url ?? null,
          prev: paginatedSections?.prev_page_url ?? null,
          next: paginatedSections?.next_page_url ?? null,
        });

        let effectiveMap = selectedMapRef.current;

        if (!initializedSelection) {
          effectiveMap = buildInitialSelectedMap(fetchedSelected, fetchedIndexs);
          selectedMapRef.current = effectiveMap;
          setSelectedMap(effectiveMap);
          setInitializedSelection(true);
        }

        setRows(buildRows(fetchedSections, effectiveMap));
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;

        setError(
          err?.response?.data?.message ?? "No se pudo cargar la información.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      moduleForCensoId,
      initializedSelection,
      buildInitialSelectedMap,
      buildRows,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(1, controller.signal);

    return () => controller.abort();
  }, [loadData]);

  const toggleSectionRow = useCallback(
    (sectionId: string, checked: boolean) => {
      setRows((prev) => {
        const nextRows = prev.map((row) =>
          row.section_id === sectionId
            ? {
                ...row,
                checked,
                selected_index_id: checked ? row.selected_index_id || "" : "",
              }
            : row,
        );

        const changedRow = nextRows.find((row) => row.section_id === sectionId);

        setSelectedMap((prevMap) => {
          const nextMap = { ...prevMap };

          if (checked && changedRow) {
            nextMap[sectionId] = {
              section_id: sectionId,
              index_id: changedRow.selected_index_id ?? "",
              stored_index_name: changedRow.stored_index_name ?? null,
            };
          } else {
            delete nextMap[sectionId];
          }

          selectedMapRef.current = nextMap;
          return nextMap;
        });

        return nextRows;
      });
    },
    [],
  );

  const toggleAllSectionRows = useCallback((checked: boolean) => {
    setRows((prev) => {
      const nextRows = prev.map((row) => ({
        ...row,
        checked,
        selected_index_id: checked ? row.selected_index_id || "" : "",
      }));

      setSelectedMap((prevMap) => {
        const nextMap = { ...prevMap };

        nextRows.forEach((row) => {
          if (checked) {
            nextMap[row.section_id] = {
              section_id: row.section_id,
              index_id: row.selected_index_id ?? "",
              stored_index_name: row.stored_index_name ?? null,
            };
          } else {
            delete nextMap[row.section_id];
          }
        });

        selectedMapRef.current = nextMap;
        return nextMap;
      });

      return nextRows;
    });
  }, []);

  const changeIndex = useCallback((sectionId: string, indexId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.section_id === sectionId
          ? {
              ...row,
              selected_index_id: indexId,
            }
          : row,
      ),
    );

    setSelectedMap((prev) => {
      if (!prev[sectionId]) return prev;

      const nextMap = {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          index_id: indexId,
        },
      };

      selectedMapRef.current = nextMap;
      return nextMap;
    });
  }, []);

  const allChecked = useMemo(() => {
    return rows.length > 0 && rows.every((row) => row.checked);
  }, [rows]);

  const validItems = useMemo(() => {
    return Object.values(selectedMap)
      .filter((item) => item.index_id)
      .map((item) => ({
        section_id: item.section_id,
        index_id: item.index_id,
      }));
  }, [selectedMap]);

  const saveChanges = useCallback(async () => {
    try {
      if (!moduleForCensoId) return false;

      if (validItems.length === 0) {
        setError("Selecciona al menos una sección y asígnale un índice.");
        return false;
      }

      setSaving(true);
      setError(null);

      if (hasAssignments) {
        await updateCensoSections(moduleForCensoId, {
          items: validItems,
        });
      } else {
        await storeCensoSections({
          module_id: moduleForCensoId,
          items: validItems,
        });
      }

      await loadData(currentPage);
      return true;
    } catch (err: any) {
      const apiError = err?.response?.data;

      if (apiError?.errors) {
        const firstKey = Object.keys(apiError.errors)[0];
        const firstMessage = apiError.errors[firstKey]?.[0];
        setError(firstMessage ?? "No se pudieron guardar los cambios.");
      } else {
        setError(apiError?.message ?? "No se pudieron guardar los cambios.");
      }

      return false;
    } finally {
      setSaving(false);
    }
  }, [moduleForCensoId, hasAssignments, validItems, loadData, currentPage]);

  const reload = useCallback(async () => {
    await loadData(currentPage);
  }, [loadData, currentPage]);

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || page > lastPage) return;
      await loadData(page);
    },
    [lastPage, loadData],
  );

  return {
    moduleInfo,
    indexs,
    sections,
    rows,
    loading,
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