import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, CircleDashed, Info } from "lucide-react";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { apiErrorMessage, getWorkbookProgress, isCanceled } from "./Workbooks.service";
import type {
  EditionProgress,
  ProgressModule,
  ProgressResponse,
  ProgressSection,
  ProgressWorkbook,
} from "./Workbooks.types";
import {
  MISSING_REASON_LABEL,
  TEMPLATE_LABEL,
  formatDateTime,
  sectionLabel,
} from "./workbookLabels";

/**
 * Tablero de avance de una edición (docs/CARGA_CENSOS.md, §7.6): un renglón por
 * sección, agrupado por módulo. Lo que falta solo se infiere y se marca como
 * «posible faltante».
 */
export default function WorkbookProgressPage() {
  const [edition, setEdition] = useState<{ program: string; year: number } | null>(null);
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getWorkbookProgress(edition, controller.signal)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(apiErrorMessage(err, "No se pudo cargar el avance."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [edition]);

  const progress = data?.progress ?? null;
  const selected = progress ? `${progress.edition.program}-${progress.edition.year}` : "";

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader subtitle="Qué ha llegado de cada edición, sección por sección." />

      <div className="space-y-6 p-4 md:p-6">
        {data && data.editions.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="edicion" className="text-sm font-medium text-gray-700">
              Edición
            </label>
            <select
              id="edicion"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--pantone-7421)] focus:outline-none"
              value={selected}
              onChange={(e) => {
                const [program, year] = e.target.value.split("-");
                setEdition({ program, year: Number(year) });
              }}
            >
              {data.editions.map((option) => (
                <option key={`${option.program}-${option.year}`} value={`${option.program}-${option.year}`}>
                  {option.program} {option.year} ({option.workbooks === 1 ? "1 cuaderno" : `${option.workbooks} cuadernos`})
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && <Loading />}
        {!loading && error && <ValidationError message={error} />}

        {!loading && !error && data && !progress && (
          <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
            Todavía no hay cuadernos identificados.{" "}
            <Link to="/admin/cuadernos" className="text-[var(--pantone-7421)] hover:underline">
              Súbelos en Recepción
            </Link>
            .
          </p>
        )}

        {!loading && !error && progress && <EditionView progress={progress} />}
      </div>
    </div>
  );
}

function EditionView({ progress }: { progress: EditionProgress }) {
  const { totals } = progress;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Secciones recibidas" value={totals.sections_received} />
        <StatTile label="Secciones con respuestas" value={totals.sections_answered} />
        <StatTile label="Posibles faltantes" value={totals.sections_possibly_missing + totals.modules_possibly_missing} hint={missingHint(totals)} />
        <StatTile label="Preguntas" value={totals.questions} hint="en los cuadernos recibidos" />
        <StatTile label="Archivos" value={totals.files} hint="identificados, sin duplicados" />
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-[#F7F3E8] p-3 text-sm text-gray-700">
        <Info size={18} className="mt-0.5 shrink-0 text-[var(--pantone-7421)]" aria-hidden="true" />
        <span>
          El sistema no sabe que un cuaderno existe hasta que llega. «Posible faltante» es una inferencia: sale de los
          huecos en la numeración
          {progress.previous_edition ? ` o de lo que se recibió de ${progress.previous_edition.year}` : ""}.
          Confírmalo con el INEGI antes de darlo por perdido.
        </span>
      </p>

      <div className="space-y-5">
        {progress.modules.map((module, i) => (
          <ModuleCard key={`${module.number ?? "x"}-${module.name ?? i}`} module={module} workbooks={progress.workbooks} />
        ))}
      </div>
    </>
  );
}

function missingHint(totals: EditionProgress["totals"]): string | undefined {
  const parts: string[] = [];
  if (totals.modules_possibly_missing) {
    parts.push(totals.modules_possibly_missing === 1 ? "1 módulo" : `${totals.modules_possibly_missing} módulos`);
  }
  if (totals.sections_possibly_missing) {
    parts.push(totals.sections_possibly_missing === 1 ? "1 sección" : `${totals.sections_possibly_missing} secciones`);
  }
  return parts.length ? parts.join(" y ") : undefined;
}

function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value.toLocaleString("es-MX")}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function ModuleCard({ module, workbooks }: { module: ProgressModule; workbooks: Record<string, ProgressWorkbook> }) {
  const missing = module.status === "possibly_missing";
  const title =
    module.number !== null
      ? `Módulo ${module.number}${module.name ? ` · ${module.name}` : ""}`
      : module.name ?? "Módulo sin nombre";

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200" aria-label={title}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {missing && (
          <MissingTag>
            {module.missing_reason === "previous_edition" && module.previous
              ? `en ${module.previous.year} era el módulo ${module.previous.number}`
              : MISSING_REASON_LABEL.gap}
          </MissingTag>
        )}
      </header>

      {missing ? (
        <p className="px-4 py-3 text-sm text-gray-600">No ha llegado ningún cuaderno de este módulo.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead>
              <tr>
                {["Sección", "Nombre", "Preguntas", "Cuaderno", "Plantilla", "Respuestas"].map((label) => (
                  <th key={label} scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {module.sections.map((section) => (
                <SectionRow key={section.number ?? "modulo"} section={section} workbooks={workbooks} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SectionRow({ section, workbooks }: { section: ProgressSection; workbooks: Record<string, ProgressWorkbook> }) {
  if (section.status === "possibly_missing") {
    return (
      <tr className="align-top text-gray-500">
        <td className="whitespace-nowrap px-4 py-2">{sectionLabel(section.number)}</td>
        <td className="px-4 py-2" colSpan={5}>
          <MissingTag>
            {MISSING_REASON_LABEL[section.missing_reason ?? "gap"]}
          </MissingTag>
          {section.previous_name && <span className="ml-2 italic">Nombre en la edición anterior: {section.previous_name}</span>}
        </td>
      </tr>
    );
  }

  const workbook = section.workbook ? workbooks[section.workbook] : null;
  const annexes = section.annexes.map((code) => workbooks[code]).filter(Boolean);
  const answered = [workbook, ...annexes].find((w) => w && w.answered_files > 0) ?? null;
  const last = answered?.last_answered ?? null;

  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
        <span className="inline-flex items-center gap-1.5">
          <CircleCheck size={16} className="text-green-700" aria-hidden="true" />
          {sectionLabel(section.number)}
          <span className="sr-only">recibida</span>
        </span>
      </td>
      <td className="px-4 py-2 text-gray-900">{section.name ?? "—"}</td>
      <td className="px-4 py-2 tabular-nums text-gray-700">{section.questions ?? "—"}</td>
      <td className="px-4 py-2">
        {section.workbook ? (
          <Link
            to={`/admin/cuadernos?buscar=${encodeURIComponent(section.workbook)}`}
            className="font-mono text-xs text-[var(--pantone-7421)] hover:underline"
            title="Ver los archivos de este cuaderno"
          >
            {section.workbook}
          </Link>
        ) : (
          <span className="text-xs text-gray-500">Solo anexo</span>
        )}
        {section.annexes.map((code) => (
          <span key={code} className="block font-mono text-xs text-gray-500">
            + {code}
          </span>
        ))}
      </td>
      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
        {workbook ? (
          <Link
            to={`/admin/cuadernos/plantillas/${encodeURIComponent(workbook.code)}`}
            className="font-medium text-[var(--pantone-7421)] hover:underline"
            title="Ver las preguntas que se leyeron de este cuaderno"
          >
            {TEMPLATE_LABEL[workbook.template_status]}
          </Link>
        ) : (
          "—"
        )}
        {workbook?.template_status === "in_review" && workbook.template_to_review ? (
          <span className="block text-xs text-orange-900">
            {workbook.template_to_review === 1 ? "1 pregunta por revisar" : `${workbook.template_to_review} preguntas por revisar`}
          </span>
        ) : null}
        {workbook?.template_status === "pending" && workbook.compile_error ? (
          <span className="block text-xs text-red-700">No se pudo compilar</span>
        ) : null}
      </td>
      <td className="px-4 py-2 text-gray-700">
        {last ? (
          <>
            <Link to={`/admin/cuadernos/archivos/${last.file_id}`} className="font-medium text-[var(--pantone-7421)] hover:underline">
              Recibidas
            </Link>
            {answered && answered.answered_files > 1 && (
              <span className="text-gray-500"> · {answered.answered_files} archivos</span>
            )}
            <span className="block text-xs text-gray-500">
              {last.institution ?? last.declared_institution ?? "Institución no declarada"} · {formatDateTime(last.received_at)}
            </span>
          </>
        ) : workbook && workbook.blank_files > 0 ? (
          <span className="text-gray-600">Solo el cuaderno en blanco</span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

function MissingTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-400 px-2 py-0.5 text-xs text-gray-700">
      <CircleDashed size={12} aria-hidden="true" />
      Posible faltante: {children}
    </span>
  );
}
