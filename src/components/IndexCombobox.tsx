import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";

export type IndexOption = {
  id: string;
  name: string;
};

export type IndexSearchResult = {
  indexes: IndexOption[];
  hasMore: boolean;
};

type Props = {
  /** Id del índice seleccionado, o "" si no hay ninguno. */
  value: string;
  /** Nombre del índice seleccionado; puede no estar en los resultados actuales. */
  valueName?: string;
  onSelect: (option: IndexOption | null) => void;
  /** Consulta al backend. Debe respetar el AbortSignal para descartar respuestas viejas. */
  search: (term: string, signal: AbortSignal) => Promise<IndexSearchResult>;
  /** Ids ya usados por otras filas de la misma pantalla, aún sin guardar. */
  excludedIds?: Set<string>;
  disabled?: boolean;
  placeholder?: string;
};

const DEBOUNCE_MS = 300;

/**
 * Selector de índices con búsqueda contra el backend.
 *
 * La tabla `indexs` ronda las 460,000 filas, así que las opciones no se pueden precargar:
 * se piden por prefijo conforme el usuario escribe. Sin término, el backend devuelve los
 * hijos directos del índice padre.
 */
export const IndexCombobox = ({
  value,
  valueName,
  onSelect,
  search,
  excludedIds,
  disabled = false,
  placeholder = "Busca un índice (ej. 1.2.3)",
}: Props) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [options, setOptions] = useState<IndexOption[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Cierra al hacer clic fuera.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Debounce + búsqueda. Se aborta la petición anterior para que una respuesta
  // lenta no pise a una más reciente.
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await search(term.trim(), controller.signal);
        setOptions(result.indexes);
        setHasMore(result.hasMore);
        setHighlighted(0);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(
          err?.response?.data?.message ?? "No se pudieron cargar los índices.",
        );
        setOptions([]);
        setHasMore(false);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, term, search]);

  const visibleOptions = excludedIds
    ? options.filter(
        (option) =>
          String(option.id) === String(value) ||
          !excludedIds.has(String(option.id)),
      )
    : options;

  // Mantiene visible la opción resaltada al navegar con el teclado.
  useEffect(() => {
    listRef.current
      ?.querySelectorAll("li")
      [highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const choose = useCallback(
    (option: IndexOption) => {
      onSelect(option);
      setOpen(false);
      setTerm("");
    },
    [onSelect],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, visibleOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = visibleOptions[highlighted];
      if (option) choose(option);
    } else if (event.key === "Escape") {
      setOpen(false);
      setTerm("");
    }
  };

  const openAndFocus = () => {
    if (disabled) return;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full rounded-lg border border-[var(--pantone-7421)] bg-white py-2 pl-8 pr-8 text-sm outline-none"
          />
          {loading && (
            <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openAndFocus}
          disabled={disabled}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-[var(--pantone-7421)] disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <span className={valueName ? "text-gray-800" : "text-gray-400"}>
            {valueName || "Selecciona un índice"}
          </span>
          <span className="flex items-center gap-1">
            {valueName && !disabled && (
              <X
                className="h-4 w-4 text-gray-400 transition hover:text-red-600"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(null);
                }}
              />
            )}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        </button>
      )}

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[14rem] rounded-lg border border-gray-200 bg-white shadow-lg">
          {error ? (
            <p className="px-3 py-2 text-sm text-red-600">{error}</p>
          ) : visibleOptions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">
              {loading
                ? "Buscando…"
                : term.trim()
                  ? `Sin índices que empiecen por "${term.trim()}".`
                  : "No hay índices disponibles."}
            </p>
          ) : (
            <>
              <ul ref={listRef} className="max-h-60 overflow-y-auto py-1">
                {visibleOptions.map((option, position) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlighted(position)}
                      onClick={() => choose(option)}
                      className={`w-full px-3 py-2 text-left text-sm transition ${
                        position === highlighted
                          ? "bg-[var(--pantone-7421)] text-white"
                          : "text-gray-700"
                      } ${
                        String(option.id) === String(value) ? "font-semibold" : ""
                      }`}
                    >
                      {option.name}
                    </button>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                  Hay más coincidencias. Escribe más dígitos para acotar.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IndexCombobox;
