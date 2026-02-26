// hooks/useCensosData.ts
import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getCensos, type CensoFilter } from "../Censos.service";
import type { Censo, PaginatedCensosResponse, Meta } from "../Censos.types";

export function useCensosData() {
  const [Censos, setCensos] = useState<Censo[]>([]);
  const [links, setLinks] = useState<PaginatedCensosResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FILTROS Y ESTADOS ---
  const [filter, setFilter] = useState<CensoFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // --- ORDENAMIENTO ---
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshCensos = useCallback(() => setReloadToken((t) => t + 1), []);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Carga de datos con mapeo de campos del backend
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getCensos(
      filter,
      debouncedSearch,
      page,
      sortConfig.key,
      sortConfig.direction,
      controller.signal
    )
      .then((data) => {
        console.log("📦 Respuesta completa del backend:", data);
        
        // Mapeamos los campos que vienen del backend (si existen) o asignamos valores de prueba
        const mappedCensos = data.data.map((censo: any, index: number) => {
          console.log("🔍 Censo individual (sin mapear):", censo);
          
          const fechaBase = new Date();
          fechaBase.setDate(fechaBase.getDate() - index * 10);
          
          return {
            ...censo,
           description: censo.description,
            start_date: censo.init_date || censo.start_date || fechaBase.toISOString().split('T')[0],
            end_date: censo.deadline || censo.end_date || new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            // Aseguramos que created_at exista para que la card calcule el año correcto
            created_at: censo.created_at || new Date().toISOString(),
            // Eliminamos la asignación de 'year' para que la card lo calcule desde created_at
          };
        });
        
     
        
        setCensos(mappedCensos);
        setLinks(data.links);
        setMeta(data.meta);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error(err);
        setError("Error al cargar los datos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]);

  // Handlers
  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as CensoFilter);
    setPage(1);
  }, []);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageChange = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get("page");
      if (pageParam) setPage(Number(pageParam));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSort = useCallback((key: keyof Censo) => {
    setSortConfig((current) => ({
      key: key as string,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    Censos,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshCensos,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}