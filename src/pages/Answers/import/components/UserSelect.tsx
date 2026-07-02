import { useEffect, useRef, useState } from "react";
import { searchImportUsers } from "../ImportAnswers.service";
import type { ImportUserOption } from "../ImportAnswers.types";

interface UserSelectProps {
  selected: ImportUserOption | null;
  onSelect: (user: ImportUserOption | null) => void;
}

/**
 * Selector de usuario destino con búsqueda (nombre, correo o institución).
 * Precargado con la sugerencia del backend pero siempre editable.
 */
export function UserSelect({ selected, onSelect }: UserSelectProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ImportUserOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setOptions(await searchImportUsers(query));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {selected.name || selected.email}
            </p>
            <p className="truncate text-xs text-gray-500">
              {selected.email}
              {selected.institution ? ` — ${selected.institution}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-sm text-blue-600 hover:underline"
            onClick={() => {
              onSelect(null);
              setOpen(true);
            }}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Buscar usuario por nombre, correo o institución…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />
      )}

      {open && !selected && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {loading && (
            <li className="px-3 py-2 text-sm text-gray-500">Buscando…</li>
          )}
          {!loading && options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">
              Sin resultados.
            </li>
          )}
          {!loading &&
            options.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-blue-50"
                  onClick={() => {
                    onSelect(user);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <p className="text-sm font-medium text-gray-800">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                    {user.institution ? ` — ${user.institution}` : ""}
                  </p>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
