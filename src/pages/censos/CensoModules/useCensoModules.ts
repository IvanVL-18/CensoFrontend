import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCensoModules,
  storeCensoModules,
  updateCensoModules,
} from "./CensoModules.service";
import type {
  CensoInfo,
  IndexInfo,
  ModuleInfo,
  AssignedModule,
  CensoModuleRow,
} from "./CensoModules.types";

type UseCensoModulesReturn = {
  censo: CensoInfo | null;
  indexes: IndexInfo[];
  rows: CensoModuleRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasAssignments: boolean;
  allChecked: boolean;
  toggleModule: (moduleId: string, checked: boolean) => void;
  toggleAllModules: (checked: boolean) => void;
  changeIndex: (moduleId: string, indexId: string) => void;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
};

export const useCensoModules = (censoId: string): UseCensoModulesReturn => {
  const [censo, setCenso] = useState<CensoInfo | null>(null);
  const [indexes, setIndexes] = useState<IndexInfo[]>([]);
  const [rows, setRows] = useState<CensoModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssignments, setHasAssignments] = useState(false);

  const buildRows = useCallback(
    (
      modules: ModuleInfo[],
      assignedModules?: AssignedModule[],
    ): CensoModuleRow[] => {
      return modules.map((module) => {
        const assigned = assignedModules?.find(
          (item) =>
            item.module.name.trim().toLowerCase() ===
            module.name.trim().toLowerCase(),
        );

        return {
          module_id: String(module.id),
          module_name: module.name,
          checked: !!assigned,
          selected_index_id: assigned ? assigned.index.id : "",
          encrypted_id: assigned ? assigned.id : null,
          stored_index_id: null,
          stored_index_name: assigned ? assigned.index.name : null,
          stored_index_encrypted_id: assigned ? assigned.index.id : null,
          stored_index_plain_id: null,
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

        const data = await getCensoModules(censoId, signal);
        const fetchedIndexes = data.indexes ?? [];

        setCenso(data.census);
        setIndexes(fetchedIndexes);
        setHasAssignments(Boolean(data.selectedModules?.length));
        const builtRows = buildRows(data.modules ?? [], data.selectedModules);

        const rowsWithIndex = builtRows.map((row) => {
          if (!row.stored_index_name) return row;
          const match = fetchedIndexes.find(
            (idx) =>
              idx.name.trim().toLowerCase() ===
              row.stored_index_name!.trim().toLowerCase(),
          );
          return {
            ...row,
            selected_index_id: match ? String(match.id) : "",
            stored_index_plain_id: match ? String(match.id) : null,
          };
        });

        setRows(rowsWithIndex);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(
          err?.response?.data?.message ?? "No se pudo cargar la información.",
        );
      } finally {
        setLoading(false);
      }
    },
    [buildRows, censoId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const toggleModule = useCallback((moduleId: string, checked: boolean) => {
    setRows((prev) =>
      prev.map((row) =>
        row.module_id === moduleId
          ? {
              ...row,
              checked,
              selected_index_id: checked
                ? row.selected_index_id || row.stored_index_plain_id || ""
                : "",
            }
          : row,
      ),
    );
  }, []);

  const allChecked = useMemo(() => {
    return rows.length > 0 && rows.every((row) => row.checked);
  }, [rows]);

  const toggleAllModules = useCallback((checked: boolean) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        checked,
        selected_index_id: checked ? row.selected_index_id : "",
      })),
    );
  }, []);

  const changeIndex = useCallback((moduleId: string, indexId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.module_id === moduleId
          ? { ...row, selected_index_id: indexId }
          : row,
      ),
    );
  }, []);

  const validItems = useMemo(() => {
    return rows
      .filter((row) => row.checked && row.selected_index_id)
      .map((row) => ({
        module_id: row.module_id,
        index_id: row.selected_index_id,
        census_module_id: row.encrypted_id ?? null,
      }));
  }, [rows]);

  const saveChanges = useCallback(async () => {
    try {
      if (!censoId) return false;

      if (validItems.length === 0) {
        setError("Selecciona un módulo y asígnale un índice.");
        return false;
      }

      setSaving(true);
      setError(null);

      if (hasAssignments) {
        await updateCensoModules(censoId, { items: validItems });
      } else {
        await storeCensoModules({ census_id: censoId, items: validItems });
      }

      await loadData();
      return true;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "No se pudieron guardar los cambios.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [censoId, hasAssignments, validItems, loadData]);

  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    censo,
    indexes,
    rows,
    loading,
    saving,
    error,
    hasAssignments,
    allChecked,
    toggleAllModules,
    toggleModule,
    changeIndex,
    saveChanges,
    reload,
  };
};
