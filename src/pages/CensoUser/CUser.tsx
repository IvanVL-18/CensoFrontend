import { useEffect, useState, useCallback, useRef, type ChangeEvent } from "react";
import { CensosCards } from "./components/CensosCards";
import { CensosToolbar } from "./components/CUserToolbar";
import { getCensos } from "./CUser.service";
import type { Censo, PaginatedCensosResponse } from "./CUser.types";

export function CUser() {
  const [censos, setCensos] = useState<Censo[]>([]);
  const [meta, setMeta] = useState<PaginatedCensosResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCensos = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // 👇 Forzamos el filtro "active" directamente
      const response = await getCensos(
        "active",            // ← filtro fijo
        searchTerm,
        currentPage,
        sortBy,
        sortDirection,
        controller.signal
      );
      setCensos(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err.message || 'Error al cargar los censos');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, sortBy, sortDirection]);

  useEffect(() => {
    fetchCensos();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchCensos]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (meta?.last_page || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <CensosToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <CensosCards
        censos={censos}
        meta={meta}
        loading={loading}
        error={error}
      />

      {meta && meta.last_page > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border bg-white disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {currentPage} de {meta.last_page}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === meta.last_page}
            className="px-3 py-1 rounded border bg-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}