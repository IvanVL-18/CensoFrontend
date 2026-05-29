import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCensusAssignments,
  storeCensusAssignments,
  updateCensusAssignments,
} from "./CensusAssignments.service";
import type {
  CensusSectionInfo,
  InstitutionOption,
  AssignmentItem,
  CensusAssignmentRow,
} from "./CensusAssignments.types";

type AssignmentsMap = Record<string, boolean>;

type UseCensusAssignmentsReturn = {
  sectionInfo: CensusSectionInfo | null;
  rows: CensusAssignmentRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasAssignments: boolean;
  allChecked: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggleRow: (institutionId: string, checked: boolean) => void;
  toggleAll: (checked: boolean) => void;
  saveChanges: () => Promise<boolean>;
  reload: () => Promise<void>;
};

export const useCensusAssignments = (
  censusSectionId: string,
): UseCensusAssignmentsReturn => {
  const [sectionInfo, setSectionInfo] = useState<CensusSectionInfo | null>(
    null,
  );
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssignments, setHasAssignments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<AssignmentsMap>({});
  const [mapVersion, setMapVersion] = useState(0);

  const updateMap = useCallback(
    (updater: (prev: AssignmentsMap) => AssignmentsMap) => {
      mapRef.current = updater(mapRef.current);
      setMapVersion((v) => v + 1);
    },
    [],
  );

  const buildInitialMap = useCallback(
    (
      allInstitutions: InstitutionOption[],
      assignments: AssignmentItem[],
    ): AssignmentsMap => {
      const assignedNames = new Set(assignments.map((a) => a.name));
      const map: AssignmentsMap = {};
      allInstitutions.forEach((inst) => {
        map[inst.id] = assignedNames.has(inst.name);
      });
      return map;
    },
    [],
  );

  const loadData = useCallback(
    async (signal?: AbortSignal, isInitial = false) => {
      try {
        isInitial ? setLoading(true) : null;
        setError(null);

        const data = await getCensusAssignments(censusSectionId, signal);

        if (signal?.aborted) return;

        const fetchedInstitutions = data.institutions ?? [];
        const fetchedAssignments = data.assignments ?? [];

        // Asignadas primero, luego las disponibles sin duplicar
        const assignedNames = new Set(fetchedAssignments.map((a) => a.name));
        const assignedAsOptions: InstitutionOption[] = fetchedAssignments.map(
          (a) => ({ id: a.institution_id, name: a.name }),
        );
        const unassignedOnly = fetchedInstitutions.filter(
          (i) => !assignedNames.has(i.name),
        );
        const merged = [...assignedAsOptions, ...unassignedOnly];

        mapRef.current = buildInitialMap(merged, fetchedAssignments);
        setMapVersion((v) => v + 1);

        setSectionInfo(data.section);
        setInstitutions(merged);
        setHasAssignments(fetchedAssignments.length > 0);
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
      }
    },
    [censusSectionId, buildInitialMap],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal, true);
    return () => controller.abort();
  }, [loadData]);

  const rows = useMemo<CensusAssignmentRow[]>(() => {
    const map = mapRef.current;
    return institutions.map((inst) => ({
      institution_id: inst.id,
      institution_name: inst.name,
      checked: map[inst.id] ?? false,
    }));
  }, [institutions, mapVersion]);

  const allChecked = useMemo(
    () => rows.length > 0 && rows.every((r) => r.checked),
    [rows],
  );

  const toggleRow = useCallback(
    (institutionId: string, checked: boolean) => {
      updateMap((prev) => ({ ...prev, [institutionId]: checked }));
    },
    [updateMap],
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      updateMap((prev) => {
        const next = { ...prev };
        institutions.forEach((inst) => {
          next[inst.id] = checked;
        });
        return next;
      });
    },
    [institutions, updateMap],
  );

  const checkedItems = useMemo(
    () =>
      Object.entries(mapRef.current)
        .filter(([, checked]) => checked)
        .map(([institution_id]) => ({ institution_id })),
    [mapVersion],
  );

  const saveChanges = useCallback(async () => {
    if (!censusSectionId) return false;

    if (checkedItems.length === 0) {
      setError("Selecciona al menos una institución.");
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      if (hasAssignments) {
        await updateCensusAssignments(censusSectionId, {
          items: checkedItems,
        });
      } else {
        await storeCensusAssignments({
          census_section_id: censusSectionId,
          items: checkedItems,
        });
      }

      await loadData(undefined, false);
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
  }, [censusSectionId, hasAssignments, checkedItems, loadData]);

  const reload = useCallback(async () => {
    await loadData(undefined, false);
  }, [loadData]);

  return {
    sectionInfo,
    rows,
    loading,
    saving,
    error,
    hasAssignments,
    allChecked,
    searchQuery,
    setSearchQuery,
    toggleRow,
    toggleAll,
    saveChanges,
    reload,
  };
};
