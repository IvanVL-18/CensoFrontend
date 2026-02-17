import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsers } from "../Users.service";
import type { User, PaginatedUsersResponse, Meta } from "../Users.types";

type SortKey = "id" | "email";
type SortDir = "asc" | "desc";

export function useUsersData() {
  const [Users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<PaginatedUsersResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const handleSort = useCallback((key: keyof User) => {
    const k = key === "email" ? "email" : "id";

    setSortKey(k);
    setSortDir((prev) => {
      if (k === sortKey) return prev === "asc" ? "desc" : "asc";
      return "asc";
    });
  }, [sortKey]);

  const sortedUsers = useMemo(() => {
    const copy = [...Users];

    copy.sort((a, b) => {
      let cmp = 0;

      if (sortKey === "id") {
        const aNum = Number(a.id);
        const bNum = Number(b.id);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          cmp = aNum - bNum;
        } else {
          cmp = String(a.id).localeCompare(String(b.id));
        }
      } else {
        cmp = String(a.email ?? "").localeCompare(String(b.email ?? ""), "es", {
          sensitivity: "base",
        });
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [Users, sortKey, sortDir]);

  return {
    Users: sortedUsers,
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
