import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import axios from "axios";
import api from "../../../lib/Axios";
import { getRoles, type RolFilter } from "../Roles.service";
import type { Rol, PaginatedRolesResponse, Meta } from "../Roles.types";

type SortConfig = {
  key: keyof Rol;
  direction: "ascending" | "descending";
};

export function useRolesData() {
  const [Roles, setRoles] = useState<Rol[]>([]);
  const [links, setLinks] = useState<PaginatedRolesResponse["links"] | null>(
    null,
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RolFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshRoles = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getRoles(filter, searchTerm, controller.signal)
      .then((response) => {
        setRoles(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === "CanceledError") {
          return;
        }
        console.error(err);
        setError(`Error al cargar los Rol: ${err.message}`);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [filter, searchTerm, reloadToken]);

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) =>
      setFilter(e.target.value as RolFilter),
    [],
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (!url) return;

      const targetUrl = new URL(url);
      const params = new URLSearchParams(targetUrl.search);

      if (searchTerm) params.set("search", searchTerm);

      setLoading(true);

      api
        .get<PaginatedRolesResponse>(
          `/Roles/${filter}/content?${params.toString()}`,
        )
        .then((response) => {
          setRoles(response.data.data);
          setLinks(response.data.links);
          setMeta(response.data.meta);
          setError(null);
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
          setError(`Error paginación: ${err.message}`);
        })
        .finally(() => setLoading(false));
    },
    [filter, searchTerm],
  );

  const handleSort = useCallback((key: keyof Rol) => {
    setSortConfig((c) => ({
      key,
      direction:
        c.key === key && c.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  }, []);

  const sortedRoles = useMemo(() => {
    const items = [...Roles];
    items.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return items;
  }, [Roles, sortConfig]);

  return {
    Roles: sortedRoles,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshRoles,
    handleFilterChange,
    handleSearchChange,
    handlePageClick,
    handleSort,
  };
}
