import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import axios from "axios";
import api from "../../../lib/Axios";
import { getSections, type SectionFilter } from "../sections.service";
import type { Section, PaginatedSectionsResponse, Meta } from "../Sections.types";

type SortConfig = {
  key: keyof Section;
  direction: "ascending" | "descending";
};

export function useSectionsData() {
  const [sections, setSections] = useState<Section[]>([]);
  const [links, setLinks] = useState<PaginatedSectionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<SectionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });

  const [reloadToken, setReloadToken] = useState(0);
  const refreshSections = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getSections(filter, searchTerm, controller.signal)
      .then((response) => {
        setSections(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === "CanceledError") return;
        console.error(err);
        setError(`Error al cargar las Secciones: ${err.message}`);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, searchTerm, reloadToken]);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as SectionFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback((url: string | null) => {
    if (!url) return;
    const targetUrl = new URL(url);
    const params = new URLSearchParams(targetUrl.search);
    if (searchTerm) params.set("search", searchTerm);

    setLoading(true);
    api.get<PaginatedSectionsResponse>(`/sections/${filter}/content?${params.toString()}`)
      .then((response) => {
        setSections(response.data.data);
        setLinks(response.data.links);
        setMeta(response.data.meta);
        setError(null);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(`Error paginación: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [filter, searchTerm]);

  const handleSort = useCallback((key: keyof Section) => {
    setSortConfig((c) => ({
      key,
      direction: c.key === key && c.direction === "ascending" ? "descending" : "ascending",
    }));
  }, []);

  const sortedSections = useMemo(() => {
    const items = [...sections];
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
  }, [sections, sortConfig]);

  return {
    sections: sortedSections,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshSections,
    handleFilterChange,
    handleSearchChange,
    handlePageClick,
    handleSort,
  };
}