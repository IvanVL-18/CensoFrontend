import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "./CensoSections.types";

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
  toggleSectionRow: (sectionId: string, checked: boolean) => void;
  toggleAllSectionRows: (checked: boolean) => void;
  changeIndex: (sectionId: string, indexId: string) => void;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
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

  const buildRows = useCallback(
    (
      allSections: SectionInfo[],
      availableIndexes: SectionIndexOption[],
      selectedSections?: SelectedSectionItem[],
    ): CensoSectionRow[] => {
      return allSections.map((section) => {
        const assigned = selectedSections?.find(
          (item) =>
            String(item.reference?.name).trim().toLowerCase() ===
            String(section.name).trim().toLowerCase(),
        );

        const matchedIndex = assigned
          ? availableIndexes.find(
              (index) =>
                String(index.name).trim().toLowerCase() ===
                String(assigned.index?.name).trim().toLowerCase(),
            )
          : null;

        return {
          section_id: String(section.id),
          section_name: section.name,
          checked: false,
          selected_index_id: matchedIndex ? String(matchedIndex.id) : "",
          stored_index_name: assigned ? (assigned.index?.name ?? null) : null,
        };
      });
    },
    [],
  );

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getCensoSections(moduleForCensoId, signal);

        setModuleInfo(data.module);
        setIndexs(data.indexs ?? []);
        setSections(data.sections?.data ?? []);
        setHasAssignments(Boolean(data.sectionsSelected?.length));
        const fetchedIndexs = data.indexs ?? [];

        setModuleInfo(data.module);
        setIndexs(fetchedIndexs);
        setSections(data.sections?.data ?? []);
        setHasAssignments(Boolean(data.sectionsSelected?.length));
        setRows(
          buildRows(
            data.sections?.data ?? [],
            fetchedIndexs,
            data.sectionsSelected,
          ),
        );
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(
          err?.response?.data?.message ?? "No se pudo cargar la información.",
        );
      } finally {
        setLoading(false);
      }
    },
    [buildRows, moduleForCensoId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);

    return () => controller.abort();
  }, [loadData]);

  const toggleSectionRow = useCallback(
    (sectionId: string, checked: boolean) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.section_id !== sectionId) return row;

          return {
            ...row,
            checked,
            selected_index_id: checked ? row.selected_index_id || "" : "",
          };
        }),
      );
    },
    [],
  );

  const toggleAllSectionRows = useCallback((checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        checked,
        selected_index_id: checked ? row.selected_index_id || "" : "",
      })),
    );
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
  }, []);

  const allChecked = useMemo(() => {
    return rows.length > 0 && rows.every((row) => row.checked);
  }, [rows]);

  const validItems = useMemo(() => {
    return rows
      .filter((row) => row.checked && row.selected_index_id)
      .map((row) => ({
        section_id: row.section_id,
        index_id: row.selected_index_id,
      }));
  }, [rows]);

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

      await loadData();
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
  }, [moduleForCensoId, hasAssignments, validItems, loadData]);

  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

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
    toggleSectionRow,
    toggleAllSectionRows,
    changeIndex,
    saveChanges,
    reload,
  };
};
