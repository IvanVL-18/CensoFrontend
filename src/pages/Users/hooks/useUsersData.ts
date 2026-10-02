import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import api from "../../../lib/Axios";
import { getUsers, type UserFilter } from "../Users.service";
import type { User, PaginatedUsersResponse, Meta } from "../Users.types";
import type { Rol } from "../../Roles/Roles.types";

const getRelatedData = async (endpoint: string, signal?: AbortSignal) => {
  try {
    const response = await api.get(`/${endpoint}`, { signal });
    return response.data.data || response.data;
  } catch (error: any) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return [];
    }
    console.warn(`No se pudo cargar ${endpoint}`, error);
    return [];
  }
};

export function useUsersData() {
  const [Users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<PaginatedUsersResponse["links"] | null>(
    null,
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<Rol[]>([]);
  const [occupations, setOccupations] = useState([]);
  const [dependencies, setDependencias] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  
  const loadRoles = useCallback(async () => {
    if (roles.length > 0) return;

    const data = await getRelatedData("roles");
    setRoles(data);
  }, [roles.length]);

  const loadOccupations = useCallback(async () => {
    if (occupations.length > 0) return;

    const data = await getRelatedData("occupations");
    setOccupations(data);
  }, [occupations.length]);

  const loadDependencies = useCallback(async () => {
    if (dependencies.length > 0) return;

    const data = await getRelatedData("dependency");
    setDependencias(data);
  }, [dependencies.length]);

  const loadInstitutions = useCallback(async () => {
    if (institutions.length > 0) return;

    const data = await getRelatedData("institutions");
    setInstitutions(data);
  }, [institutions.length]);
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshUsers = useCallback(() => setReloadToken((t) => t + 1), []);

  

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getUsers(
      filter,
      searchTerm,
      page,
      sortConfig.key,
      sortConfig.direction,
      controller.signal,
    )
      .then((data) => {
        setUsers(data.data);
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
  }, [filter, searchTerm, page, sortConfig, reloadToken]);

  // La búsqueda ya se resuelve en el servidor (ver getUsers -> POST /users/search),
  // por lo que `Users` ya llega filtrado. Volver a filtrar aquí en el cliente
  // solo por `name`/`email` podía dejar la lista vacía cuando el backend
  // encontraba coincidencias por otros campos (documento, teléfono, rol, etc.),
  // mostrando "No se encontraron Usuarios" aunque el Network sí trajera registros.
  const sortedUsers = useMemo(() => {
    return [...Users].sort((a, b) => {
      const valA = (a[sortConfig.key as keyof User] ?? "") as string;
      const valB = (b[sortConfig.key as keyof User] ?? "") as string;
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [Users, sortConfig]);

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value as UserFilter);
      setPage(1);
    },
    [],
  );

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
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

  const handleSort = useCallback((key: keyof User) => {
    setSortConfig((current) => ({
      key: key as string,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    Users: sortedUsers,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    sortConfig,

    roles,
    occupations,
    dependencies,
    institutions,

    loadRoles,
    loadOccupations,
    loadDependencies,
    loadInstitutions,

    refreshUsers,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}
