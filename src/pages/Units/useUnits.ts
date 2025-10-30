import { useState, useEffect, type ChangeEvent, useMemo } from "react";
import { getUnits, type UnitFilter } from "./units.service";
import type { Unit, PaginatedUnitsResponse, Meta } from "./units.interfaces";

/**
 * Hook personalizado para manejar toda la lógica del listado de Unidades.
 * Se encarga de:
 * - Cargar los datos de la API.
 * - Manejar los estados de carga, error y paginación.
 * - Gestionar los filtros, búsqueda y ordenamiento.
 * - Exponer las funciones para interactuar con los datos (eliminar, restaurar, etc.).
 */
export const useUnits = () => {
  // --- Estados de Datos ---
  const [units, setUnits] = useState<Unit[]>([]);
  const [links, setLinks] = useState<PaginatedUnitsResponse["links"] | null>(
    null
  );
  const [meta, setMeta] = useState<Meta | null>(null);

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de Filtro y Ordenamiento ---
  const [filter, setFilter] = useState<UnitFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Unit;
    direction: "ascending" | "descending";
  }>({ key: "name", direction: "ascending" });

  // --- Lógica de Carga de Datos ---
  const loadUnits = (url?: string) => {
    setLoading(true);

    // Si se provee una URL (de paginación), úsala. Si no, usa el servicio con el filtro.
    const fetchPromise = url
      ? fetch(url).then((res) => res.json() as Promise<PaginatedUnitsResponse>)
      : getUnits(filter);

    fetchPromise
      .then((response) => {
        setUnits(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Modulos: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Carga inicial y recarga cuando el filtro cambia
  useEffect(() => {
    loadUnits();
  }, [filter]);

  // --- Handlers (Manejadores de Eventos) ---

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as UnitFilter);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageClick = (url: string | null) => {
    if (url) {
      loadUnits(url);
    }
  };

  const handleSort = (key: keyof Unit) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // --- Handlers de Acciones (Listos para tu lógica de API) ---

  const handleDesactivate = (id: number | string) => {
    console.log("Desactivar (Soft Delete) Módulo con ID:", id);
    // TODO: Implementar llamada a la API (ej. api.delete(`/units/${id}`))
    // .then(() => {
    //   console.log("Módulo desactivado");
    //   loadUnits(); // Recargar la lista
    // })
    // .catch(err => console.error("Error al desactivar", err));
  };

  const handleRestore = (id: number | string) => {
    console.log("Restaurar Módulo con ID:", id);
    // TODO: Implementar llamada a la API (ej. api.post(`/units/${id}/restore`))
    // .then(() => {
    //   console.log("Módulo restaurado");
    //   loadUnits(); // Recargar la lista
    // })
    // .catch(err => console.error("Error al restaurar", err));
  };

  const handleDelete = (id: number | string) => {
    console.log("Eliminar Permanentemente Módulo con ID:", id);
    // TODO: Implementar llamada a la API (ej. api.delete(`/units/${id}/force-delete`))
    // .then(() => {
    //   console.log("Módulo eliminado permanentemente");
    //   loadUnits(); // Recargar la lista
    // })
    // .catch(err => console.error("Error al eliminar", err));
  };

  // --- Datos Computados (Memoizados) ---

  // Primero filtra por búsqueda
  const filteredUnits = useMemo(() => {
    return units.filter((unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  // Luego ordena los resultados filtrados
  const sortedUnits = useMemo(() => {
    let sortableItems = [...filteredUnits];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUnits, sortConfig]);

  // --- Retorno del Hook ---
  // Exponemos solo lo que el componente necesita
  return {
    // Estados
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    // Datos
    sortedUnits,
    // Handlers
    handleFilterChange,
    handleSearchChange,
    handlePageClick,
    handleSort,
    handleDesactivate,
    handleRestore,
    handleDelete,
  };
};