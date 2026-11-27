import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { assignInstitution, getInstitutionOptions } from "../Answers.service";
import type { InstitutionOption, InstitutionOptions } from "../Answers.types";
import { apiErrorMessage, isCanceled } from "../Workbooks.service";
import type { WorkbookFileDetail } from "../Workbooks.types";

const SEARCH_DELAY_MS = 400;

interface InstitutionPickerProps {
  fileId: string;
  onAssigned: (file: WorkbookFileDetail, linked: number) => void;
  onCancel: () => void;
}

/**
 * Liga el archivo con una institución del catálogo (docs/CARGA_CENSOS.md, D17).
 * El sistema sugiere las que comparten palabras con el nombre declarado, pero quien
 * decide es la persona: nunca se liga sola por parecido.
 */
export function InstitutionPicker({ fileId, onAssigned, onCancel }: InstitutionPickerProps) {
  const groupId = useId();
  const [options, setOptions] = useState<InstitutionOptions | null>(null);
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<InstitutionOption | null>(null);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Los ids llegan cifrados y cambian en cada respuesta: la elección se conserva por nombre.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        setLoading(true);
        getInstitutionOptions(fileId, search.trim(), controller.signal)
          .then((data) => {
            setOptions(data);
            setError(null);
            setChosen((current) =>
              current
                ? ([...data.suggestions, ...data.results].find((o) => o.name === current.name) ?? current)
                : current,
            );
          })
          .catch((err) => {
            if (!isCanceled(err)) setError(apiErrorMessage(err, "No se pudieron cargar las instituciones."));
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      search ? SEARCH_DELAY_MS : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fileId, search]);

  const save = async () => {
    if (!chosen) return;
    setSaving(true);
    setError(null);
    try {
      const result = await assignInstitution(fileId, chosen.id, remember && Boolean(options?.declared));
      onAssigned(result.data, result.linked);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo ligar la institución."));
    } finally {
      setSaving(false);
    }
  };

  const option = (item: InstitutionOption, hint?: string) => (
    <label
      key={item.name}
      className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm has-[:checked]:border-[var(--pantone-7421)] has-[:checked]:bg-[#F7F3E8]"
    >
      <input
        type="radio"
        name={groupId}
        className="mt-0.5 accent-[var(--pantone-7421)]"
        checked={chosen?.name === item.name}
        onChange={() => setChosen(item)}
      />
      <span>
        {item.name}
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );

  const suggestions = options?.suggestions ?? [];
  const results = (options?.results ?? []).filter((r) => !suggestions.some((s) => s.name === r.name));

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <h4 className="font-semibold text-gray-800">¿A qué institución pertenece este archivo?</h4>
        {options?.declared ? (
          <p className="mt-1 text-sm text-gray-700">
            El informante declaró: <span className="font-medium">«{options.declared}»</span>
          </p>
        ) : (
          options && <p className="mt-1 text-sm text-gray-700">El archivo no declara ninguna institución.</p>
        )}
      </div>

      {suggestions.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Se parecen en el catálogo
          </legend>
          {suggestions.map((item) =>
            option(item, item.shared_words === 1 ? "1 palabra en común" : `${item.shared_words} palabras en común`),
          )}
        </fieldset>
      )}

      {options && suggestions.length === 0 && options.declared && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Ninguna institución del catálogo se le parece. Búscala por nombre; si no existe, dala de alta en{" "}
          <Link to="/instituciones" className="font-medium underline">
            Instituciones
          </Link>{" "}
          con el mismo nombre y vuelve a abrir este archivo: se ligará solo.
        </p>
      )}

      <div>
        <label htmlFor={`${groupId}-search`} className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
          Buscar en el catálogo
        </label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id={`${groupId}-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={90}
            placeholder="Nombre de la institución"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-[var(--pantone-7421)] focus:outline-none focus:ring-1 focus:ring-[var(--pantone-7421)]"
          />
        </div>
        {search.trim() !== "" && !loading && results.length === 0 && (
          <p className="mt-2 text-sm text-gray-600">Sin resultados para «{search.trim()}».</p>
        )}
        {results.length > 0 && <div className="mt-2 space-y-2">{results.map((item) => option(item))}</div>}
      </div>

      {options?.declared && (
        <label className="flex items-start gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            className="mt-0.5 accent-[var(--pantone-7421)]"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span>
            Recordar este nombre
            <span className="block text-xs text-gray-500">
              Los siguientes archivos que declaren «{options.declared}» se ligarán solos a la institución elegida.
            </span>
          </span>
        </label>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!chosen || saving}
          className="rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Ligar institución"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
          Cancelar
        </button>
        {loading && <span className="text-xs text-gray-500">Cargando…</span>}
      </div>
    </div>
  );
}
