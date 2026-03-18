import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getquestions, type questionFilter } from "../Answers.service";
import type { question, PaginatedquestionsResponse, Meta } from "../Answers.types";

export function usequestionsData() {
  const [questions, setquestions] = useState<question[]>([]);
  const [links, setLinks] = useState<PaginatedquestionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<questionFilter>("active"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  
  const [page, setPage] = useState(1); 

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id", 
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshquestions = useCallback(() => setReloadToken((t) => t + 1), []);

  // 1. EFECTO DEBOUNCE
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. EFECTO DE CARGA DE DATOS
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getquestions(
      filter, 
      debouncedSearch, 
      page, 
      sortConfig.key,      
      sortConfig.direction,
      controller.signal
    )
      .then((data) => {
        setquestions(data.data);
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
    setFilter(e.target.value as questionFilter);
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
    } catch (e) { console.error(e); }
  }, []);

  const handleSort = useCallback((key: keyof question) => {
    setSortConfig((current) => ({
      key: key as string,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    questions,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshquestions,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}