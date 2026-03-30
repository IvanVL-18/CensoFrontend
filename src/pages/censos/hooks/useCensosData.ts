import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { getCensos } from "../Censos.service";
import type { CensoFilter } from "../Censos.service";
import type { Censo, PaginatedCensosResponse, Meta } from "../Censos.types";

type RawCenso = Censo & {
  init_date?: string | null;
  deadline?: string | null;
};

const isCanceledError = (err: unknown): boolean => {
  if (typeof err !== "object" || err === null) return false;
  const maybeErr = err as { name?: string; code?: string };
  return maybeErr.name === "CanceledError" || maybeErr.code === "ERR_CANCELED";
};

const mapCenso = (censo: RawCenso, index: number): Censo => {
  const fechaBase = new Date();
  fechaBase.setDate(fechaBase.getDate() - index * 10);

  return {
    ...censo,
    deleted_at: censo.deleted_at ?? null,
    start_date:
      censo.init_date ||
      censo.start_date ||
      fechaBase.toISOString().split("T")[0],
    end_date:
      censo.deadline ||
      censo.end_date ||
      new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    created_at: censo.created_at || new Date().toISOString(),
  };
};

const buildLocalLinks = (currentPage: number, lastPage: number) => {
  const makeUrl = (p: number) => `http://local.pagination/censos?page=${p}`;
  return {
    first: lastPage >= 1 ? makeUrl(1) : null,
    last: lastPage >= 1 ? makeUrl(lastPage) : null,
    prev: currentPage > 1 ? makeUrl(currentPage - 1) : null,
    next: currentPage < lastPage ? makeUrl(currentPage + 1) : null,
  };
};

export function useCensosData() {
  const [Censos, setCensos] = useState<Censo[]>([]);
  const [links, setLinks] = useState<PaginatedCensosResponse["links"] | null>(
    null,
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CensoFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "id",
    direction: "asc",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshCensos = useCallback(() => setReloadToken((t) => t + 1), []);

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

    const run = async () => {
      try {
        const query = debouncedSearch.trim().toLowerCase();

        if (!query) {
          const data = await getCensos(
            filter,
            debouncedSearch,
            page,
            sortConfig.key,
            sortConfig.direction,
            controller.signal,
          );

          setCensos(data.data.map((censo, index) => mapCenso(censo, index)));
          setLinks(data.links);
          setMeta(data.meta);
          setError(null);
          return;
        }

        const firstPage = await getCensos(
          filter,
          "",
          1,
          sortConfig.key,
          sortConfig.direction,
          controller.signal,
        );

        const totalPages = Number(firstPage.meta?.last_page ?? 1);
        const restPromises: Array<Promise<PaginatedCensosResponse>> = [];

        for (let p = 2; p <= totalPages; p += 1) {
          restPromises.push(
            getCensos(
              filter,
              "",
              p,
              sortConfig.key,
              sortConfig.direction,
              controller.signal,
            ),
          );
        }

        const restPages = await Promise.all(restPromises);
        const rawAll = [firstPage, ...restPages].flatMap((resp) => resp.data);
        const mappedAll = rawAll.map((censo, index) => mapCenso(censo, index));

        const filteredAll = mappedAll.filter((censo) => {
          const name = censo.name?.toLowerCase() ?? "";
          const description = censo.description?.toLowerCase() ?? "";
          return name.includes(query) || description.includes(query);
        });

        const perPage = Number(firstPage.meta?.per_page ?? 10);
        const localLastPage = Math.max(1, Math.ceil(filteredAll.length / perPage));
        const safePage = Math.min(page, localLastPage);

        const fromIndex = (safePage - 1) * perPage;
        const toIndex = fromIndex + perPage;

        setCensos(filteredAll.slice(fromIndex, toIndex));
        setLinks(buildLocalLinks(safePage, localLastPage));
        setMeta({
          ...firstPage.meta,
          total: filteredAll.length,
          current_page: safePage,
          last_page: localLastPage,
          from: filteredAll.length === 0 ? 0 : fromIndex + 1,
          to: Math.min(toIndex, filteredAll.length),
        });

        if (safePage !== page) {
          setPage(safePage);
        }

        setError(null);
      } catch (err: unknown) {
        if (isCanceledError(err)) return;
        setError("Error al cargar los datos.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [filter, debouncedSearch, page, sortConfig, reloadToken]);

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value as CensoFilter);
      setPage(1);
    },
    [],
  );

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageChange = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get("page");
      if (pageParam) setPage(Number(pageParam));
    } catch (error) {
      console.warn("Error parsing page URL:", error);
    }
  }, []);

  const handleSort = useCallback((key: keyof Censo) => {
    setSortConfig((current) => ({
      key: key as string,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    Censos,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshCensos,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
  };
}
