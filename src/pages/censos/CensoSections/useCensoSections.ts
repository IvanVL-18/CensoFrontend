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
  index_id: string; // ID encriptado actual (se recalcula en rows según index_name)
  index_name: string; // Nombre estable del índice (ej: "1.1") — fuente de verdad
  stored_index_name: string | null;
  checked: boolean;
};

type SelectedSectionsMap = Record<string, SelectedSectionState>;

type UseCensoSectionsReturn = {
  moduleInfo: ModuleSectionInfo | null;
  indexs: SectionIndexOption[];
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

export const useCensoSections = (
  moduleForCensoId: string,
): UseCensoSectionsReturn => {
  const [moduleInfo, setModuleInfo] = useState<ModuleSectionInfo | null>(null);
  const [indexs, setIndexs] = useState<SectionIndexOption[]>([]);
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

  const updateMap = useCallback(
    (updater: (prev: SelectedSectionsMap) => SelectedSectionsMap) => {
      mapRef.current = updater(mapRef.current);
      setMapVersion((v) => v + 1);
    },
    [],
  );

  const initialLoadDone = useRef(false);

  const buildInitialMap = useCallback(
    (
      selectedSections: SelectedSectionItem[],
      availableIndexes: SectionIndexOption[],
    ): SelectedSectionsMap => {
      const map: SelectedSectionsMap = {};

      selectedSections.forEach((item) => {
        // Normaliza espacios múltiples en el nombre clave del map
        const sectionName = (item.section?.name ?? "")
          .replace(/\s+/g, " ")
          .trim();
        const sectionId = item.section?.section_id ?? "";
        if (!sectionName) return;

        const matchedIndex = availableIndexes.find(
          (idx) =>
            idx.name.trim().toLowerCase() ===
            item.index?.name?.trim().toLowerCase(),
        );

        map[sectionName] = {
          section_id: sectionId,
          index_id: matchedIndex ? String(matchedIndex.id) : "",
          index_name: item.index?.name ?? "",
          stored_index_name: item.index?.name ?? null,
          checked: true,
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

        const data = await getCensoSections(moduleForCensoId, page, signal);

        if (signal?.aborted) return;

        const fetchedIndexs = data.indexs ?? [];
        const fetchedSections = data.sections?.data ?? [];
        const fetchedSelected = data.sectionsSelected ?? [];

        // Construye el mapa fresco del backend
        const freshMap = buildInitialMap(fetchedSelected, fetchedIndexs);

        if (!initialLoadDone.current) {
          // Primera carga: usa el mapa del backend tal cual
          mapRef.current = freshMap;
          initialLoadDone.current = true;
        } else {
          // Paginaciones siguientes: agrega al map las entradas del backend
          // que el usuario NO ha tocado aún (no existen en el map actual)
          const currentMap = mapRef.current;
          const merged: typeof currentMap = { ...currentMap };

          Object.entries(freshMap).forEach(([name, backendEntry]) => {
            if (!currentMap[name]) {
              // Sección nueva en esta página que viene precargada del backend
              merged[name] = backendEntry;
            }
            // Si ya existe en el map (el usuario la vio/modificó), no se toca
          });

          mapRef.current = merged;
        }

        setModuleInfo(data.module);
        setIndexs(fetchedIndexs);
        setHasAssignments(Boolean(fetchedSelected.length));
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
    [moduleForCensoId, buildInitialMap],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(1, controller.signal, true);
    return () => controller.abort();
  }, [loadData]);

  const rows = useMemo<CensoSectionRow[]>(() => {
    const map = mapRef.current;

    return sections.map((section) => {
      // Normaliza espacios múltiples para evitar fallos de match
      const normalizedName = section.name.replace(/\s+/g, " ").trim();
      const sel = map[normalizedName] ?? map[section.name];
      const isChecked = sel?.checked ?? false;

      // Recalcula el index_id desde el nombre estable, por si los IDs encriptados cambiaron
      const currentIndexId = sel?.index_name
        ? (indexs.find((idx) => idx.name === sel.index_name)?.id ?? "")
        : "";

      return {
        section_id: section.id,
        section_name: section.name,
        checked: isChecked,
        selected_index_id: isChecked ? String(currentIndexId) : "",
        stored_index_name: isChecked ? (sel?.stored_index_name ?? null) : null,
      };
    });
  }, [sections, indexs, mapVersion]);

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
          indexs.find((idx) => String(idx.id) === String(indexId))?.name ?? "";
        return {
          ...prev,
          [key]: { ...prev[key], index_id: indexId, index_name: idxName },
        };
      });
    },
    [updateMap, indexs],
  );

  const validItems = useMemo(
    () =>
      Object.values(mapRef.current)
        .filter((item) => item.checked && item.index_id) // ← filtra por checked Y con index
        .map((item) => ({
          section_id: item.section_id,
          index_id: item.index_id,
        })),
    [mapVersion],
  );

  const saveChanges = useCallback(async () => {
    if (!moduleForCensoId) return false;

    if (validItems.length === 0) {
      setError("Selecciona al menos una sección y asígnale un índice.");
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      if (hasAssignments) {
        await updateCensoSections(moduleForCensoId, { items: validItems });
      } else {
        await storeCensoSections({
          module_id: moduleForCensoId,
          items: validItems,
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
  }, [moduleForCensoId, hasAssignments, validItems, loadData, currentPage]);

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
    indexs,
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
