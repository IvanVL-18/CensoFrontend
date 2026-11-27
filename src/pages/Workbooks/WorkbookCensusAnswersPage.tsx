import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, CircleCheck, CircleDashed } from "lucide-react";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { getAnswersEditions, getAnswersOverview } from "./CensusAnswers.service";
import type { AnswersEdition, AnswersOverview, OverviewSection } from "./CensusAnswers.types";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { apiErrorMessage, isCanceled } from "./Workbooks.service";
import { formatDateTime } from "./workbookLabels";

const editionKey = (edition: { program: string; year: number }) => `${edition.program}-${edition.year}`;

/**
 * Respuestas por edición (docs/CARGA_CENSOS.md, §7.7): los módulos y secciones de un censo
 * armado desde cuadernos, quién contestó cada sección y cuánto. Desde aquí se abre la vista
 * digital de una sección. No muestra valores.
 */
export default function WorkbookCensusAnswersPage() {
  const [params, setParams] = useSearchParams();
  const wanted = params.get("edicion");

  const [editions, setEditions] = useState<AnswersEdition[] | null>(null);
  const [overview, setOverview] = useState<AnswersOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAnswersEditions(controller.signal)
      .then(setEditions)
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(apiErrorMessage(err, "No se pudieron cargar las ediciones."));
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Sin elegir, la edición más reciente que ya tenga respuestas.
  const selected =
    editions?.find((edition) => editionKey(edition) === wanted) ??
    editions?.find((edition) => edition.answered > 0) ??
    editions?.[0] ??
    null;
  const selectedKey = selected ? editionKey(selected) : null;

  useEffect(() => {
    if (editions === null) return;
    if (!selected) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    getAnswersOverview(selected.program, selected.year, controller.signal)
      .then((data) => {
        setOverview(data);
        setError(null);
      })
      .catch((err) => {
        if (!isCanceled(err)) setError(apiErrorMessage(err, "No se pudo cargar el censo."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // selected sale de editions y de la dirección: basta su clave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editions, selectedKey]);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader subtitle="Lo que cada institución respondió, sección por sección, tal como quedó importado de sus cuadernos." />

      <div className="space-y-5 p-4 md:p-6">
        {editions && editions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Edición">
            {editions.map((edition) => {
              const active = editionKey(edition) === selectedKey;
              return (
                <button
                  key={editionKey(edition)}
                  type="button"
                  onClick={() => setParams({ edicion: editionKey(edition) })}
                  aria-pressed={active}
                  className={
                    active
                      ? "rounded-full border border-[var(--pantone-7421)] bg-[var(--pantone-7421)] px-3 py-1 text-sm text-white"
                      : "rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:border-[var(--pantone-7421)]"
                  }
                >
                  {edition.program} {edition.year}
                  <span className="ml-1.5 tabular-nums opacity-80">
                    {edition.answered.toLocaleString("es-MX")} de {edition.questions.toLocaleString("es-MX")}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading && <Loading />}
        {!loading && error && <ValidationError message={error} />}

        {!loading && !error && editions && editions.length === 0 && (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            Todavía no hay censos armados desde cuadernos. Sube un cuaderno en{" "}
            <Link to="/admin/cuadernos" className="font-medium text-[var(--pantone-7421)] underline">
              Recepción
            </Link>
            .
          </p>
        )}

        {!loading && !error && overview && selected && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{overview.census.name}</h2>
              <p className="text-sm text-gray-600">
                {overview.totals.sections_answered} de {overview.totals.sections} secciones con respuestas ·{" "}
                {overview.totals.answered.toLocaleString("es-MX")} de {overview.totals.questions.toLocaleString("es-MX")} preguntas
                contestadas ·{" "}
                {overview.totals.institutions === 1 ? "1 institución" : `${overview.totals.institutions} instituciones`}
              </p>
            </div>

            {overview.totals.answered === 0 && (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                De esta edición todavía no se han importado respuestas. Las secciones aparecen porque ya se recibió su
                cuaderno.
              </p>
            )}

            {overview.modules.map((module) => (
              <section key={module.number ?? module.name} aria-label={`Módulo ${module.number}`}>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Módulo {module.number}
                  {module.name ? ` · ${module.name}` : ""}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Sección", "Nombre", "Contestó", "Preguntas contestadas", ""].map((label, i) => (
                          <th key={i} scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            {label || <span className="sr-only">Abrir</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {module.sections.map((section) => (
                        <SectionRow key={section.index} section={section} program={selected.program} year={selected.year} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SectionRow({ section, program, year }: { section: OverviewSection; program: string; year: number }) {
  const answered = section.institutions.length > 0;
  const url = `/admin/cuadernos/respuestas/${encodeURIComponent(program)}/${year}/${encodeURIComponent(section.index)}`;

  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
        <span className="inline-flex items-center gap-1.5">
          {answered ? (
            <CircleCheck size={16} className="text-green-700" aria-hidden="true" />
          ) : (
            <CircleDashed size={16} className="text-gray-400" aria-hidden="true" />
          )}
          <span className="font-mono text-xs">{section.index}</span>
          <span className="sr-only">{answered ? "con respuestas" : "sin respuestas"}</span>
        </span>
      </td>
      <td className="px-4 py-2 text-gray-900">{section.name ?? "—"}</td>
      <td className="px-4 py-2 text-gray-800">
        {answered ? (
          section.institutions.map((institution) => (
            <span key={institution.name} className="block">
              {institution.name}
              <span className="block text-xs text-gray-500">Actualizado el {formatDateTime(institution.updated_at)}</span>
            </span>
          ))
        ) : (
          <span className="text-gray-500">Sin respuestas importadas</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-2 tabular-nums text-gray-800">
        {answered
          ? section.institutions.map((institution) => (
              <span key={institution.name} className="block">
                {institution.answered} de {section.questions}
              </span>
            ))
          : `0 de ${section.questions}`}
      </td>
      <td className="px-4 py-2 text-right">
        <Link
          to={url}
          className="inline-flex items-center gap-0.5 whitespace-nowrap text-sm font-medium text-[var(--pantone-7421)] hover:underline"
          aria-label={`Abrir la sección ${section.index}`}
        >
          {answered ? "Ver respuestas" : "Ver preguntas"}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
}
