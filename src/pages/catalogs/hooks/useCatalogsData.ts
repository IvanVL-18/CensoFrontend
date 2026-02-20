import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getCatalogs, type CatalogFilter } from "../Catalogs.service";
import type { Catalog, PaginatedCatalogsResponse, Meta } from "../Catalogs.types";

export function useCatalogsData() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [links, setLinks] = useState<PaginatedCatalogsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshCatalogs = useCallback(() => setReloadToken(t => t + 1), []);

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

    getCatalogs(filter, debouncedSearch, page, sortConfig.key, sortConfig.direction, controller.signal)
      .then(data => {
        setCatalogs(data.data);
        setLinks(data.links);
        setMeta(data.meta);
        setError(null);
      })
      .catch(err => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError("Error al cargar los datos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as CatalogFilter);
    setPage(1);
  }, []);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageChange = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const pageParam = new URL(url).searchParams.get("page");
      if (pageParam) setPage(Number(pageParam));
    } catch {
      // Silently handle invalid URL
    }
  }, []);

  const handleSort = useCallback((key: keyof Catalog) => {
    setSortConfig(current => ({
      key: key as string,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

// En useCatalogsData.ts - línea donde haces el return
return {
  Catalogs: catalogs, // Así se llama Catalogs (con C mayúscula)
  loading,
  error,
  meta,
  links,
  filter,
  searchTerm,
  refreshCatalogs,
  handleFilterChange,
  handleSearch,
  handlePageChange,
  handleSort,
};
}