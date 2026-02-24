import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getModulos, type ModuloFilter } from "../Modulos.service";
import type { Modulo, PaginatedModulosResponse, Meta } from "../Modulos.types";

export function useModulosData() {
  const [Modulos, setModulos] = useState<Modulo[]>([]);
  const [links, setLinks] = useState<PaginatedModulosResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FILTROS Y ESTADOS ---
  const [filter, setFilter] = useState<ModuloFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para guardar el término "confirmado" después de que el usuario deje de escribir
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  
  const [page, setPage] = useState(1); 

  // --- ORDENAMIENTO ---
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id", // Orden por defecto (No.)
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshModulos = useCallback(() => setReloadToken((t) => t + 1), []);

  // 1. EFECTO DEBOUNCE (Optimización de Búsqueda)
  // Espera 500ms después de que dejes de escribir para actualizar la búsqueda real
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Resetear a pág 1 cuando cambie la búsqueda real
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. EFECTO DE CARGA DE DATOS
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    // Usamos debouncedSearch en lugar de searchTerm directo
    getModulos(
      filter, 
      debouncedSearch, 
      page, 
      sortConfig.key,      // Enviamos columna
      sortConfig.direction, // Enviamos dirección
      controller.signal
    )
      .then((data) => {
        setModulos(data.data);
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
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]); // Agregamos sortConfig a dependencias

  // --- HANDLERS ---

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as ModuloFilter);
    setPage(1);
  }, []);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Nota: No reseteamos page aquí, lo hace el useEffect del debounce
  }, []);

  const handlePageChange = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get("page");
      if (pageParam) setPage(Number(pageParam));
    } catch (e) { console.error(e); }
  }, []);

  // 3. IMPLEMENTACIÓN DEL SORT
  const handleSort = useCallback((key: keyof Modulo) => {
    setSortConfig((current) => ({
      key: key as string,
      // Si damos click en la misma columna, invertimos dirección. Si es nueva, empezamos en asc.
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return { 
    Modulos,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshModulos,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort, // Ya funciona de verdad
  };
}