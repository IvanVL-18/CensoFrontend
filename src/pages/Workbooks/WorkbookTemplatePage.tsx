import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, CircleCheck, Info, TriangleAlert } from "lucide-react";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { useAuthContext } from "../../context/AuthContext";
import { KIND_LABEL, anchorLabel, anchorPhrase } from "../../lib/compiledTemplate";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { AnsweredSourceNotice, MatchBadge, ReviewBadge, TemplateStatusBadge } from "./components/TemplateBadges";
import { approveWorkbookTemplate, compileWorkbookTemplate, getWorkbookTemplate } from "./Templates.service";
import type { TemplateQuestionRow, WorkbookTemplateSummary } from "./Templates.types";
import { apiErrorMessage, isCanceled } from "./Workbooks.service";
import { DESIGN_HELP, DESIGN_LABEL, FLAG_LABEL } from "./templateLabels";
import { formatDateTime, sectionLabel } from "./workbookLabels";

type Filter = "all" | "pending" | "new" | "retouched" | "same" | "flagged";

const FILTERS: { key: Filter; label: string; test: (q: TemplateQuestionRow) => boolean }[] = [
  { key: "all", label: "Todas", test: () => true },
  { key: "pending", label: "Por revisar", test: (q) => q.review_status === "pending" },
  { key: "new", label: "Nuevas", test: (q) => q.match_status === "new" },
  { key: "retouched", label: "Con retoques", test: (q) => q.match_status === "retouched" },
  { key: "same", label: "Iguales", test: (q) => q.match_status === "same" },
  { key: "flagged", label: "Con dudas", test: (q) => q.flags.length > 0 },
];

/**
 * Revisión de la plantilla de un cuaderno (docs/CARGA_CENSOS.md, §7.1, paso 5):
 * lo que el sistema leyó de cada pregunta. Solo esperan revisión las nuevas, las
 * que cambiaron y las que el compilador marcó como dudosas.
 */
export default function WorkbookTemplatePage() {
  const { code = "" } = useParams<{ code: string }>();
  const { hasPermission } = useAuthContext();
  const canApprove = hasPermission("workbooks.import");

  const [summary, setSummary] = useState<WorkbookTemplateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setSummary(null);
    setNotice(null);
    getWorkbookTemplate(code, controller.signal)
      .then((response) => {
        setSummary(response);
        setError(null);
        // Si hay algo por revisar, eso es lo primero que se ve.
        setFilter(response.questions.some((q) => q.review_status === "pending") ? "pending" : "all");
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(apiErrorMessage(err, "No se pudo cargar la plantilla del cuaderno."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [code]);

  const run = useCallback(async (action: () => Promise<WorkbookTemplateSummary>, done: (result: WorkbookTemplateSummary) => string) => {
    setWorking(true);
    setNotice(null);
    try {
      const result = await action();
      setSummary(result);
      setError(null);
      setNotice(done(result));
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo completar la acción."));
    } finally {
      setWorking(false);
    }
  }, []);

  const counts = useMemo(() => {
    const questions = summary?.questions ?? [];
    return Object.fromEntries(FILTERS.map((f) => [f.key, questions.filter(f.test).length])) as Record<Filter, number>;
  }, [summary]);

  const visible = useMemo(() => {
    const test = FILTERS.find((f) => f.key === filter)?.test ?? (() => true);
    return (summary?.questions ?? []).filter(test);
  }, [summary, filter]);

  const cleanPending = (summary?.questions ?? []).filter((q) => q.review_status === "pending" && q.flags.length === 0).length;
  const workbook = summary?.workbook ?? null;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader subtitle="Lo que el sistema leyó de cada pregunta del cuaderno. Solo hay que revisar las nuevas, las que cambiaron y las dudosas." />

      <div className="space-y-5 p-4 md:p-6">
        <Link to="/admin/cuadernos/avance" className="inline-flex items-center gap-1.5 text-sm text-[var(--pantone-7421)] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al avance
        </Link>

        {loading && <Loading />}
        {error && <ValidationError message={error} />}

        {workbook && summary && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Módulo {workbook.module_number}
                  {workbook.module_name ? ` · ${workbook.module_name}` : ""}
                </h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  {workbook.program} {workbook.year} · <span className="font-mono text-xs">{workbook.code}</span>
                  {workbook.census ? ` · ${workbook.census}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {workbook.compiled_at ? `Compilada el ${formatDateTime(workbook.compiled_at)}` : "Todavía sin compilar"}
                  {workbook.design ? ` · diseño ${(DESIGN_LABEL[workbook.design] ?? workbook.design).toLowerCase()}` : ""}
                </p>
              </div>
              <TemplateStatusBadge status={workbook.template_status} toReview={workbook.report?.to_review} />
            </header>

            {workbook.template_status === "pending" && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <span className="flex items-start gap-2">
                  <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {workbook.compile_error ?? "Este cuaderno todavía no tiene plantilla. Se compila cuando la cola procesa su archivo."}
                </span>
                {canApprove && (
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => run(() => compileWorkbookTemplate(code), () => "La compilación quedó en la cola. Vuelve a entrar en unos segundos.")}
                    className="rounded-lg border border-amber-700 px-3 py-1.5 font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                  >
                    Compilar ahora
                  </button>
                )}
              </div>
            )}

            {workbook.design && DESIGN_HELP[workbook.design] && (
              <p className="flex items-start gap-2 rounded-lg bg-[#F7F3E8] p-3 text-sm text-gray-700">
                <Info size={18} className="mt-0.5 shrink-0 text-[var(--pantone-7421)]" aria-hidden="true" />
                {DESIGN_HELP[workbook.design]}
              </p>
            )}

            {workbook.report?.blank === false && <AnsweredSourceNotice />}

            {notice && (
              <p className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800" role="status">
                <CircleCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                {notice}
              </p>
            )}

            {summary.questions.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar las preguntas">
                  {FILTERS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      aria-pressed={filter === option.key}
                      onClick={() => setFilter(option.key)}
                      className={clsx(
                        "rounded-full border px-3 py-1 text-sm transition",
                        filter === option.key
                          ? "border-[var(--pantone-7421)] bg-[var(--pantone-7421)] text-white"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      {option.label} <span className="tabular-nums opacity-80">{counts[option.key]}</span>
                    </button>
                  ))}
                </div>

                {canApprove && cleanPending > 0 && (
                  <button
                    type="button"
                    disabled={working}
                    onClick={() =>
                      run(
                        () => approveWorkbookTemplate(code, "clean"),
                        (result) =>
                          result.approved === 1 ? "Se aprobó 1 pregunta." : `Se aprobaron ${result.approved ?? 0} preguntas.`,
                      )
                    }
                    className="rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                    title="Aprueba las pendientes en las que el compilador no encontró dudas. Las dudosas se aprueban una por una."
                  >
                    {working ? "Aprobando…" : `Aprobar las ${cleanPending} sin dudas`}
                  </button>
                )}
              </div>
            )}

            <QuestionsTable code={code} questions={visible} empty={summary.questions.length === 0 ? "Este cuaderno todavía no tiene preguntas compiladas." : "Ninguna pregunta coincide con el filtro."} />

            {summary.missing.length > 0 && (
              <section aria-labelledby="sin-equivalente" className="rounded-xl border border-gray-200 p-4">
                <h3 id="sin-equivalente" className="font-semibold text-gray-800">
                  Preguntas de {summary.missing[0].year} que ya no aparecen ({summary.missing.length})
                </h3>
                <p className="mt-0.5 text-sm text-gray-600">
                  Estaban en las mismas secciones de la edición anterior y ninguna pregunta de esta edición se les parece.
                  Solo es un aviso.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {summary.missing.map((question) => (
                    <li key={`${question.workbook}-${question.anchor}`} className="flex gap-3">
                      <span className="shrink-0 font-mono text-xs text-gray-500">{anchorLabel(question.anchor)}</span>
                      <span className="text-gray-700">{question.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QuestionsTable({ code, questions, empty }: { code: string; questions: TemplateQuestionRow[]; empty: string }) {
  if (questions.length === 0) {
    return <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Núm.", "Pregunta", "Tipo", "Comparación", "Revisión"].map((label) => (
              <th key={label} scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {questions.map((question) => (
            <tr key={question.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-700">
                {anchorLabel(question.anchor)}
                <span className="block font-sans text-[11px] text-gray-500">{sectionLabel(question.section_number)}</span>
              </td>
              <td className="max-w-xl px-4 py-3">
                <Link
                  to={`/admin/cuadernos/plantillas/${encodeURIComponent(code)}/${question.id}`}
                  className="line-clamp-2 font-medium text-gray-900 hover:text-[var(--pantone-7421)] hover:underline"
                >
                  {question.text}
                </Link>
                {question.flags.length > 0 && (
                  <span className="mt-1 flex items-start gap-1.5 text-xs text-amber-900">
                    <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {question.flags.map((flag) => FLAG_LABEL[flag] ?? flag).join(" · ")}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                {KIND_LABEL[question.kind]}
                {/* En los bloques repetidos el conteo solo trae los campos de fuera de los bloques. */}
                {(question.kind !== "blocks" || question.fields > 0) && (
                  <span className="block text-xs text-gray-500">
                    {question.fields === 1 ? "1 campo" : `${question.fields.toLocaleString("es-MX")} campos`}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <MatchBadge status={question.match_status} />
                {question.matched && (
                  <span className="mt-1 block text-xs text-gray-500">
                    {question.matched.anchor === question.anchor
                      ? `mismo número en ${question.matched.year}`
                      : `es ${anchorPhrase(question.matched.anchor)} de ${question.matched.year}`}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <ReviewBadge status={question.review_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
