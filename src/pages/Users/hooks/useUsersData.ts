import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { getUsers, type UserFilter } from "../Users.service";
import type { User, PaginatedUsersResponse, Meta } from "../Users.types";

export function useUsersData() {
  const [Users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<PaginatedUsersResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshUsers = useCallback(() => setReloadToken((t) => t + 1), []);
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

    getUsers(
      filter,
      debouncedSearch,
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
      .catch((err: any) => {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) {
          return;
        }
        console.error(err);
        setError("Error al cargar los datos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]);
  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as UserFilter);
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

  const handleSort = useCallback((key: keyof User) => {
    setSortConfig((current) => ({
      key: key as string,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    Users,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshUsers,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}
