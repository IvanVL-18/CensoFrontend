import { useEffect, useState } from "react";
import { getCensusFilters, queryCensusSections } from "../Censos.service";
import type {
  FilterSelectorItem,
  FilterIndicator,
  CensusQuerySection,
  CensusQueryFilters,
} from "../Censos.types";

export function useCensusQuery(censusId: string | undefined) {
  const [modules, setModules] = useState<FilterSelectorItem[]>([]);
  const [indicators, setIndicators] = useState<FilterIndicator[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>("");
  const [requiredAttention, setRequiredAttention] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sections, setSections] = useState<CensusQuerySection[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    if (!censusId) return;
    const controller = new AbortController();
    setFiltersLoading(true);
    setFiltersError(null);
    getCensusFilters(censusId, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setModules(res.modules);
          setIndicators(res.indicators);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setFiltersError(err?.message ?? "Error al cargar filtros.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setFiltersLoading(false);
      });
    return () => controller.abort();
  }, [censusId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!censusId || !selectedModuleId) {
      setSections([]);
      return;
    }
    const controller = new AbortController();
    setQueryLoading(true);
    setQueryError(null);

    const filters: CensusQueryFilters = {
      census_id: censusId,
      module_id: selectedModuleId,
    };
    if (selectedIndicatorId !== "") filters.indicator_id = selectedIndicatorId;
    if (requiredAttention !== undefined) filters.required_attention = requiredAttention;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

    queryCensusSections(filters, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setSections(res.sections);
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setQueryError(err?.message ?? "Error al consultar secciones.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setQueryLoading(false);
      });

    return () => controller.abort();
  }, [censusId, selectedModuleId, selectedIndicatorId, requiredAttention, debouncedSearch]);

  return {
    modules,
    indicators,
    filtersLoading,
    filtersError,
    selectedModuleId,
    setSelectedModuleId,
    selectedIndicatorId,
    setSelectedIndicatorId,
    requiredAttention,
    setRequiredAttention,
    search,
    setSearch,
    sections,
    queryLoading,
    queryError,
  };
}
