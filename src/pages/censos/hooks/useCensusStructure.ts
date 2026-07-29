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
import { compareIndex } from "../../../utils/censusIndex";

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

  /*
   * Índices de sección permitidos por el filtro de indicador/atención. Se compara por índice
   * y no por id: los ids viajan encriptados con IV aleatorio, así que dos respuestas del
   * backend nunca producen la misma cadena para la misma sección.
   */
  const [allowedIndexes, setAllowedIndexes] = useState<Set<string> | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Load full structure once
  useEffect(() => {
    if (!censusId) return;
    setStructureLoading(true);
    setError(null);
    getCensusStructure(censusId, "full")
      .then((res) =>
        setAllModules(
          [...res.census_modules]
            .map((m) => ({
              ...m,
              census_sections: (m.census_sections ?? []).map((s) => ({
                ...s,
                census_questions: s.census_questions ?? [],
              })),
            }))
            .sort((a, b) => compareIndex(a.module.index, b.module.index)),
        ),
      )
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
      setAllowedIndexes(null);
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
          setAllowedIndexes(new Set(res.sections.map((s) => s.index)));
      })
      .catch(() => {
        if (!controller.signal.aborted) setAllowedIndexes(null);
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

    if (allowedIndexes !== null) {
      result = result
        .map((m) => ({
          ...m,
          census_sections: m.census_sections.filter((s) =>
            allowedIndexes.has(s.section.index),
          ),
        }))
        .filter((m) => m.census_sections.length > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matches = (index: string, name: string) =>
        name.toLowerCase().includes(q) || index.toLowerCase().includes(q);

      result = result
        .map((m) => ({
          ...m,
          census_sections: m.census_sections
            .map((s) => {
              // Si casa la sección se muestra completa; si no, solo las preguntas que casan.
              if (matches(s.section.index, s.section.name)) return s;
              const hits = s.census_questions.filter((q2) =>
                matches(q2.question.index, q2.question.name),
              );
              return hits.length > 0 ? { ...s, census_questions: hits } : null;
            })
            .filter((s): s is NonNullable<typeof s> => s !== null),
        }))
        .filter((m) => m.census_sections.length > 0);
    }

    return result;
  }, [allModules, selectedModuleId, allowedIndexes, search]);

  return {
    modules: filtered,
    moduleOptions,
    indicators,
    loading: structureLoading || queryLoading,
    structureLoading,
    error,
  };
}
