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
  indexs: IndexInfo[];
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
  const [indexs, setIndexs] = useState<IndexInfo[]>([]);
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
            String(item.reference?.name).trim().toLowerCase() ===
            String(module.name).trim().toLowerCase(),
        );

        return {
          module_id: String(module.id),
          module_name: module.name,
          checked: false,
          selected_index_id: "",
          encrypted_id: assigned ? assigned.encrypted_id : null,
          stored_index_id: assigned ? String(assigned.index?.id) : null,
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

        const data = await getCensoModules(censoId, signal);
        const fetchedIndexs = data.indexs ?? [];

        setCenso(data.censo);
        setIndexs(fetchedIndexs);
        setHasAssignments(Boolean(data.indexForCensos?.length));
        setRows(buildRows(data.modules ?? [], data.indexForCensos));
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
              selected_index_id: checked ? row.selected_index_id : "",
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
          ? {
              ...row,
              selected_index_id: indexId,
            }
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
        await updateCensoModules(censoId, {
          items: validItems,
        });
      } else {
        await storeCensoModules({
          censo_id: censoId,
          items: validItems,
        });
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
    indexs,
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
