import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { getCensos } from "../../CUser.service";
import type { Censo, PaginatedCensosResponse, Meta } from "../../CUser.types";

export function useCensosData() {
  const [Censos, setCensos] = useState<Censo[]>([]);
  const [links, setLinks] = useState<PaginatedCensosResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshCensos = useCallback(() => setReloadToken((t) => t + 1), []);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Obtener censos (siempre activos)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    // Llamada al servicio con filtro fijo "active"
    getCensos(
      "active",               // 👈 FORZAMOS activos siempre
      debouncedSearch,
      page,
      sortConfig.key,
      sortConfig.direction,
      controller.signal
    )
      .then((data) => {
        // Mapeo opcional para asegurar fechas (ajusta según tus datos)
        const mappedCensos = data.data.map((censo: any, index: number) => {
          const fechaBase = new Date();
          fechaBase.setDate(fechaBase.getDate() - index * 10);

          return {
            ...censo,
            start_date: censo.init_date || censo.start_date || fechaBase.toISOString().split('T')[0],
            end_date: censo.deadline || censo.end_date || new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            created_at: censo.created_at || new Date().toISOString(),
          };
        });

        setCensos(mappedCensos);
        setLinks(data.links);
        setMeta(data.meta);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError("Error al cargar los datos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, page, sortConfig, reloadToken]); // filter ya no está

  // Manejadores
  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageChange = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get("page");
      if (pageParam) setPage(Number(pageParam));
    } catch {
      // URL inválida, ignorar
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
    searchTerm,               // para el toolbar
    refreshCensos,
    handleSearch,             // para el toolbar
    handlePageChange,
    handleSort,
  };
}