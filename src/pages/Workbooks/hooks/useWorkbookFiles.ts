import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage, isCanceled, searchWorkbookFiles } from "../Workbooks.service";
import type { WorkbookFileFilter, WorkbookFilesPage } from "../Workbooks.types";

/** Cada cuánto se vuelve a consultar mientras haya archivos en cola o identificándose. */
const POLL_MS = 3000;

/** Tiempo en cola a partir del cual se avisa que la cola puede estar detenida. */
const STALLED_MS = 90_000;

/**
 * Lista de archivos recibidos: filtro, búsqueda con espera de 500 ms, página y
 * consulta periódica mientras el backend diga que hay pendientes. Las consultas
 * periódicas no muestran el indicador de carga ni vacían la tabla.
 */
export function useWorkbookFiles(initialSearch = "") {
  const [filter, setFilter] = useState<WorkbookFileFilter>("all");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<WorkbookFilesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stalled, setStalled] = useState(false);

  const [reloadToken, setReloadToken] = useState(0);
  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  const lastQuery = useRef<string | null>(null);
  const lastSearch = useRef(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm === lastSearch.current) return;
      lastSearch.current = searchTerm;
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    const query = JSON.stringify([filter, debouncedSearch, page]);
    const silent = lastQuery.current === query;
    lastQuery.current = query;
    if (!silent) setLoading(true);

    searchWorkbookFiles({ status: filter, search: debouncedSearch, page }, controller.signal)
      .then((data) => {
        setResult(data);
        setError(null);
        const now = Date.now();
        setStalled(
          data.data.some(
            (file) =>
              file.status === "queued" &&
              file.created_at !== null &&
              now - new Date(file.created_at).getTime() > STALLED_MS,
          ),
        );
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        if (!silent) setError(apiErrorMessage(err, "No se pudo cargar la lista de archivos."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, debouncedSearch, page, reloadToken]);

  // Vuelve a consultar mientras haya archivos pendientes.
  useEffect(() => {
    if (!result?.pending) return;
    const timer = setTimeout(refresh, POLL_MS);
    return () => clearTimeout(timer);
  }, [result, refresh]);

  const changeFilter = useCallback((value: WorkbookFileFilter) => {
    setFilter(value);
    setPage(1);
  }, []);

  return {
    files: result?.data ?? [],
    meta: result?.meta ?? null,
    links: result?.links ?? null,
    counts: result?.counts ?? null,
    pending: result?.pending ?? false,
    stalled,
    loading,
    error,
    filter,
    searchTerm,
    setSearchTerm,
    changeFilter,
    setPage,
    refresh,
  };
}
