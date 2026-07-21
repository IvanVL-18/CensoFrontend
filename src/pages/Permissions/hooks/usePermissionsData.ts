import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getPermissions, type PermissionFilter } from "../Permissions.service";
import type { Permission, PaginatedPermissionsResponse, Meta } from "../Permissions.types";

export function usePermissionsData() {
  const [Permissions, setPermissions] = useState<Permission[]>([]);
  const [links, setLinks] = useState<PaginatedPermissionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FILTROS Y ESTADOS ---
  const [filter, setFilter] = useState<PermissionFilter>("all");
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
  const refreshPermissions = useCallback(() => setReloadToken((t) => t + 1), []);

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
    getPermissions(
      filter, 
      debouncedSearch, 
      page, 
      sortConfig.key,      // Enviamos columna
      sortConfig.direction, // Enviamos dirección
      controller.signal
    )
      .then((data) => {
        setPermissions(data.data);
        setLinks(data.links);
        setMeta(data.meta);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error(err);
        const validationErrors = err.response?.data?.errors;
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0] as string[];
          setError(firstError[0]);
        } else {
          setError(err.response?.data?.message ?? "Error al cargar los datos.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]); // Agregamos sortConfig a dependencias

  // --- HANDLERS ---

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as PermissionFilter);
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
  const handleSort = useCallback((key: keyof Permission) => {
    setSortConfig((current) => ({
      key: key as string,
      // Si damos click en la misma columna, invertimos dirección. Si es nueva, empezamos en asc.
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    Permissions,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshPermissions,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort, // Ya funciona de verdad
  };
}