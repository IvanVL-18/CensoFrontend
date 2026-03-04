import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { getCensos } from "../Censos.service";
import type { CensoFilter } from "../Censos.service";
import type { Censo, PaginatedCensosResponse, Meta } from "../Censos.types";

export function useCensosData() {
  const [Censos, setCensos] = useState<Censo[]>([]);
  const [links, setLinks] = useState<PaginatedCensosResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CensoFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshCensos = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]);

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
    } catch {
    
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