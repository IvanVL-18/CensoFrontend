import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getQuestions, type QuestionFilter } from "../Questions.service";
import type { Question, PaginatedQuestionsResponse, Meta } from "../Questions.types";

export function useQuestionsData() {
  const [Questions, setQuestions] = useState<Question[]>([]);
  const [links, setLinks] = useState<PaginatedQuestionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controller espera "active" como default, no "all"
  const [filter, setFilter] = useState<QuestionFilter>("active"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  
  const [page, setPage] = useState(1); 

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id", 
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshQuestions = useCallback(() => setReloadToken((t) => t + 1), []);

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

    getQuestions(
      filter, 
      debouncedSearch, 
      page, 
      sortConfig.key,      
      sortConfig.direction,
      controller.signal
    )
      .then((data) => {
        setQuestions(data.data);
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
    setFilter(e.target.value as QuestionFilter);
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

  const handleSort = useCallback((key: keyof Question) => {
    setSortConfig((current) => ({
      key: key as string,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    Questions,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshQuestions,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}