import { useState, useEffect, useCallback } from "react";
import { getUsers } from "../Users.service";
import type { User, PaginatedUsersResponse, Meta } from "../Users.types";

export function useUsersData() {
  const [Users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<PaginatedUsersResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const refreshUsers = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getUsers(page, controller.signal)
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
  }, [page, reloadToken]);

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

  const handleSort = useCallback((_key: keyof User) => {}, []);

  return {
    Users,
    setUsers, 
    loading,
    error,
    meta,
    links,
    refreshUsers,
    handlePageChange,
    handleSort,
  };
}
