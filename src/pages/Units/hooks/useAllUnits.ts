import { useState, useEffect } from "react";
import { getUnits } from "../units.service"; // Cambiar a .service
import type { Unit, PaginatedUnitsResponse } from "../units.types"; // Importar tipos necesarios

export function useAllUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getUnits("all", "", 1, "id", "asc", controller.signal, 1000)
      .then((data: PaginatedUnitsResponse) => {
        setUnits(data.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "CanceledError") return;
        setError("Error al cargar unidades");
        console.error(err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return { units, loading, error };
}