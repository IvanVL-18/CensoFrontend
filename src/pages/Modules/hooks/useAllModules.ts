import { useState, useEffect } from "react";
import { getModules } from "../Modules.service"; // Cambiar a .service
import type { Module, PaginatedModulesResponse } from "../Modules.types"; // Importar tipos necesarios

export function useAllModules() {
  const [Modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getModules("all", "", 1, "id", "asc", controller.signal, 1000)
      .then((data: PaginatedModulesResponse) => {
        setModules(data.data);
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

  return { Modules, loading, error };
}