import { useState, useEffect } from "react";
import { getIndicators } from "../Indicators.service"; // Cambiar a .service
import type {
  Indicator,
  PaginatedIndicatorsResponse,
} from "../Indicators.types"; // Importar tipos necesarios

export function useAllIndicators() {
  const [Indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getIndicators("all", "", 1, "id", "asc", controller.signal, 1000)
      .then((data: PaginatedIndicatorsResponse) => {
        setIndicators(data.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError("Error al cargar Modulos");
        console.error(err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return { Indicators, loading, error };
}
