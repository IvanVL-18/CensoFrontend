import { useEffect, useMemo, useState } from "react";
import {
  getCensusStructure,
  getCensusFilters,
  queryCensusSections,
} from "../Censos.service";
import type {
  CensusViewModuleItem,
  FilterSelectorItem,
  FilterIndicator,
  CensusQueryFilters,
} from "../Censos.types";

export function useCensusStructure(
  censusId: string | undefined,
  selectedModuleId: string,
  selectedIndicatorId: string,
  requiredAttention: boolean | undefined,
  search: string,
) {
  // Full structure loaded once
  const [allModules, setAllModules] = useState<CensusViewModuleItem[]>([]);
  const [structureLoading, setStructureLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Indicators from filters endpoint
  const [indicators, setIndicators] = useState<FilterIndicator[]>([]);

  // Section IDs allowed by indicator/attention query
  const [allowedIds, setAllowedIds] = useState<Set<string> | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Load full structure once
  useEffect(() => {
    if (!censusId) return;
    setStructureLoading(true);
    setError(null);
    getCensusStructure(censusId, "full")
      .then((res) => setAllModules(res.census_modules))
      .catch((err) => setError(err?.message ?? "Error al cargar la estructura del censo."))
      .finally(() => setStructureLoading(false));
  }, [censusId]);

  // Load indicators once
  useEffect(() => {
    if (!censusId) return;
    getCensusFilters(censusId)
      .then((res) => setIndicators(res.indicators))
      .catch(() => {});
  }, [censusId]);

  // When indicator/attention is active and module is selected → query for allowed section IDs
  useEffect(() => {
    const hasActiveFilter =
      selectedIndicatorId !== "" || requiredAttention !== undefined;

    if (!censusId || !selectedModuleId || !hasActiveFilter) {
      setAllowedIds(null);
      return;
    }

    const controller = new AbortController();
    setQueryLoading(true);

    const filters: CensusQueryFilters = {
      census_id: censusId,
      module_id: selectedModuleId,
    };
    if (selectedIndicatorId) filters.indicator_id = selectedIndicatorId;
    if (requiredAttention !== undefined) filters.required_attention = requiredAttention;

    queryCensusSections(filters, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted)
          setAllowedIds(new Set(res.sections.map((s) => s.id)));
      })
      .catch(() => {
        if (!controller.signal.aborted) setAllowedIds(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setQueryLoading(false);
      });

    return () => controller.abort();
  }, [censusId, selectedModuleId, selectedIndicatorId, requiredAttention]);

  const moduleOptions = useMemo<FilterSelectorItem[]>(
    () =>
      allModules.map((m) => ({
        id: m.module.id,
        name: `${m.module.index} — ${m.module.name}`,
      })),
    [allModules],
  );

  const filtered = useMemo(() => {
    let result = allModules;

    if (selectedModuleId) {
      result = result.filter((m) => m.module.id === selectedModuleId);
    }

    if (allowedIds !== null) {
      result = result
        .map((m) => ({
          ...m,
          census_sections: m.census_sections.filter((s) =>
            allowedIds.has(s.section.id),
          ),
        }))
        .filter((m) => m.census_sections.length > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result
        .map((m) => ({
          ...m,
          census_sections: m.census_sections.filter(
            (s) =>
              s.section.name.toLowerCase().includes(q) ||
              s.section.index.toLowerCase().includes(q),
          ),
        }))
        .filter((m) => m.census_sections.length > 0);
    }

    return result;
  }, [allModules, selectedModuleId, allowedIds, search]);

  return {
    modules: filtered,
    moduleOptions,
    indicators,
    loading: structureLoading || queryLoading,
    structureLoading,
    error,
  };
}
