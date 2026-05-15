import { useEffect, useState } from "react";
import { getCensusStructure } from "../Censos.service";
import type { CensusViewModuleItem } from "../Censos.types";

export function useCensusView(censusId: string | undefined) {
  const [modules, setModules] = useState<CensusViewModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!censusId) return;
    setLoading(true);
    setError(null);
    getCensusStructure(censusId, "full")
      .then((res) => setModules(res.census_modules))
      .catch((err) => setError(err?.message ?? "Error al cargar el censo."))
      .finally(() => setLoading(false));
  }, [censusId]);

  return { modules, loading, error };
}
