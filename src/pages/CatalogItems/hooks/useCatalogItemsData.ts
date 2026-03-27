import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getCatalogItems, type CatalogItemFilter } from "../CatalogItems.service";
import type {
  CatalogItem,
  PaginatedCatalogItemsResponse,
  Meta,
} from "../CatalogItems.types";

export function useCatalogItemsData() {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [links, setLinks] =
    useState<PaginatedCatalogItemsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CatalogItemFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshDependencies = useCallback(() => setReloadToken((t) => t + 1), []);

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

    getCatalogItems(
      filter,
      debouncedSearch,
      page,
      sortConfig.key,
      sortConfig.direction,
      controller.signal,
    )
      .then((data) => {
        setCatalogItems(data.data ?? []);
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

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as CatalogItemFilter);
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

  const handleSort = useCallback((key: keyof CatalogItem) => {
    setPage(1);

    setSortConfig((current) => {
      const sameColumn = current.key === (key as string);
      const nextDirection: "asc" | "desc" = sameColumn
        ? current.direction === "asc"
          ? "desc"
          : "asc"
        : "desc";

      return {
        key: key as string,
        direction: nextDirection,
      };
    });
  }, []);

  return {
    catalogItems,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshDependencies,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}
