import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, ChevronLeft, ChevronRight, FileDown, Loader2, Lock, Printer, TriangleAlert } from "lucide-react";
import { DigitalAnswer } from "../../components/compiled/DigitalAnswer";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { useAuthContext } from "../../context/AuthContext";
import { KIND_LABEL, anchorLabel, anchorPhrase, withYears } from "../../lib/compiledTemplate";
import { getSectionAnswers, getSectionBundle } from "./CensusAnswers.service";
import type { QuestionAnswers, SectionAnswers, SectionBundle, SectionQuestion } from "./CensusAnswers.types";
import { QuestionStatusBadge } from "./components/AnswerBadges";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { apiErrorMessage, isCanceled } from "./Workbooks.service";
import { formatDateTime } from "./workbookLabels";

/**
 * Vista digital de una sección (docs/CARGA_CENSOS.md, §7.7): el cuestionario con lo que
 * respondió una institución, pregunta por pregunta, acomodado para leerse. Cada pregunta se
 * puede ver también como viene en el Excel. Los valores piden workbook-answers.view.
 *
 * Las respuestas de toda la sección llegan en una sola petición; lo que se difiere es el
 * dibujo de cada tarjeta, hasta que entra a la pantalla.
 */
export default function WorkbookSectionAnswersPage() {
  const { program = "", year: yearParam = "", index = "" } = useParams();
  const year = Number(yearParam);
  const { hasPermission } = useAuthContext();
  const canSee = hasPermission("workbook-answers.view");

  const [data, setData] = useState<SectionAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Institución elegida, por nombre: su id llega cifrado y cambia en cada respuesta. */
  const [chosen, setChosen] = useState<string | null>(null);
  const institutions = useRef<SectionAnswers["institutions"]>([]);

  const [bundle, setBundle] = useState<SectionBundle | null>(null);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setBundle(null);
    setBundleError(null);
    const id = chosen ? institutions.current.find((item) => item.name === chosen)?.id : undefined;

    getSectionAnswers(program, year, index, id, controller.signal)
      .then((section) => {
        institutions.current = section.institutions;
        setData(section);
        setError(null);
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(
          (err as { status?: number })?.status === 404
            ? "Esa sección no existe en el censo."
            : apiErrorMessage(err, "No se pudo cargar la sección."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [program, year, index, chosen]);

  const institution = data?.institution ?? null;
  const answered = useMemo(() => data?.questions.filter((question) => question.answered) ?? [], [data]);

  // Con la lista de la sección ya en pantalla, las respuestas: todas en una petición.
  useEffect(() => {
    if (!canSee || !institution || answered.length === 0) return;
    const controller = new AbortController();
    const id = institutions.current.find((item) => item.name === institution)?.id;

    getSectionBundle(program, year, index, id, controller.signal)
      .then((all) => {
        setBundle(all);
        setBundleError(null);
      })
      .catch((err) => {
        if (!isCanceled(err)) setBundleError(apiErrorMessage(err, "No se pudieron cargar las respuestas."));
      });
    return () => controller.abort();
  }, [canSee, institution, answered.length, program, year, index, retry]);

  const details = useMemo(() => new Map((bundle?.questions ?? []).map((item) => [item.question.id, item])), [bundle]);

  // Para imprimir se dibujan todas las tarjetas y, ya pintadas, se abre la impresión.
  useEffect(() => {
    if (!printing) return;
    const timer = setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [printing]);

  const download = async () => {
    if (!bundle) return;
    setExporting(true);
    setActionError(null);
    try {
      const { exportSectionAnswers } = await import("./exportSectionAnswers");
      await exportSectionAnswers(bundle);
    } catch (err) {
      setActionError(apiErrorMessage(err, "No se pudo generar el Excel."));
    } finally {
      setExporting(false);
    }
  };

  const base = `/admin/cuadernos/respuestas/${encodeURIComponent(program)}/${year}`;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg print:rounded-none print:shadow-none">
      <div className="print:hidden">
        <WorkbooksHeader />
      </div>

      <div className="space-y-5 p-4 md:p-6 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            to={`/admin/cuadernos/respuestas?edicion=${encodeURIComponent(program)}-${year}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--pantone-7421)] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a las secciones de {program} {year}
          </Link>
          {data && (
            <nav className="flex items-center gap-2 text-sm" aria-label="Otras secciones">
              <SectionStep to={data.section.previous ? `${base}/${data.section.previous}` : null} label={data.section.previous ?? "Anterior"} icon="left" />
              <SectionStep to={data.section.next ? `${base}/${data.section.next}` : null} label={data.section.next ?? "Siguiente"} icon="right" />
            </nav>
          )}
        </div>

        {loading && !data && <Loading />}
        {!loading && error && <ValidationError message={error} />}

        {!error && data && (
          <>
            <header className="space-y-1">
              <p className="text-sm text-gray-600">
                {data.census.name} · Módulo {data.module.number}
                {data.module.name ? ` · ${data.module.name}` : ""}
              </p>
              <h2 className="text-xl font-semibold text-gray-900">
                Sección {data.section.index}
                {data.section.name ? ` · ${data.section.name}` : ""}
              </h2>
              {institution ? (
                <p className="text-sm text-gray-800">
                  Respuestas de <span className="font-medium">{institution}</span> · {answered.length} de{" "}
                  {data.questions.length} preguntas contestadas
                </p>
              ) : (
                <p className="text-sm text-gray-700">Todavía no hay respuestas importadas de esta sección.</p>
              )}
              {data.files.length > 0 && (
                <p className="text-xs text-gray-500">
                  Importadas de{" "}
                  {data.files.map((file, i) => (
                    <span key={file.id}>
                      {i > 0 && ", "}
                      <Link to={`/admin/cuadernos/archivos/${file.id}`} className="underline print:no-underline">
                        «{file.original_name}»
                      </Link>{" "}
                      (versión {file.version}, {formatDateTime(file.imported_at)})
                    </span>
                  ))}
                </p>
              )}
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              {data.institutions.length > 1 ? (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  Institución
                  <select
                    value={institution ?? ""}
                    onChange={(event) => setChosen(event.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-[var(--pantone-7421)] focus:outline-none"
                  >
                    {data.institutions.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} ({item.answered})
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span />
              )}

              {canSee && answered.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={download}
                    disabled={!bundle || exporting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--pantone-7421)] px-3 py-1.5 text-sm font-medium text-[var(--pantone-7421)] hover:bg-[#F7F3E8] disabled:opacity-50"
                  >
                    {exporting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <FileDown size={16} aria-hidden="true" />}
                    {exporting ? "Generando…" : "Descargar Excel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrinting(true)}
                    disabled={!bundle || printing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--pantone-7421)] px-3 py-1.5 text-sm font-medium text-[var(--pantone-7421)] hover:bg-[#F7F3E8] disabled:opacity-50"
                  >
                    {printing ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Printer size={16} aria-hidden="true" />}
                    {printing ? "Preparando…" : "Imprimir o guardar PDF"}
                  </button>
                </div>
              )}
            </div>

            {actionError && <p className="text-sm text-red-700 print:hidden">{actionError}</p>}
            {bundleError && (
              <p className="text-sm text-red-700 print:hidden">
                {bundleError}{" "}
                <button type="button" onClick={() => setRetry((n) => n + 1)} className="font-medium underline">
                  Reintentar
                </button>
              </p>
            )}

            {canSee ? (
              <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                Respuestas confidenciales del cuestionario: no las compartas fuera del equipo.
              </p>
            ) : (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Puedes ver qué preguntas se contestaron, pero para ver las respuestas hace falta el permiso de respuestas de
                los cuadernos.
              </p>
            )}

            <ol className="space-y-4">
              {data.questions.map((question) => (
                <li key={`${institution}-${question.id}`}>
                  <QuestionCard
                    question={question}
                    detail={details.get(question.id)}
                    failed={bundleError !== null}
                    year={data.census.year}
                    canSee={canSee}
                    drawNow={printing}
                  />
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}

function SectionStep({ to, label, icon }: { to: string | null; label: string; icon: "left" | "right" }) {
  const content = (
    <>
      {icon === "left" && <ChevronLeft size={16} aria-hidden="true" />}
      <span className="font-mono text-xs">{label}</span>
      {icon === "right" && <ChevronRight size={16} aria-hidden="true" />}
    </>
  );
  const className = "inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1";

  return to ? (
    <Link to={to} className={`${className} text-gray-800 hover:border-[var(--pantone-7421)]`} title={`Sección ${label}`}>
      {content}
    </Link>
  ) : (
    <span className={`${className} cursor-not-allowed text-gray-400`} aria-disabled="true">
      {content}
    </span>
  );
}

interface QuestionCardProps {
  question: SectionQuestion;
  /** Su respuesta; undefined mientras llegan las de la sección. */
  detail: QuestionAnswers | undefined;
  /** Las respuestas de la sección no se pudieron cargar. */
  failed: boolean;
  year: number;
  canSee: boolean;
  /** Dibujar aunque no esté en pantalla (para imprimir). */
  drawNow: boolean;
}

/** Una pregunta de la sección. Su respuesta se dibuja cuando la tarjeta entra a la pantalla. */
function QuestionCard({ question, detail, failed, year, canSee, drawNow }: QuestionCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"digital" | "excel">("digital");

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  const previous = detail?.previous ?? null;
  const draw = visible || drawNow;
  // Lo de la edición anterior que no casa uno a uno con esta y se ve aparte.
  const previousApart = [
    previous?.answer?.lists.some((rows) => rows.length > 0) ? "las tablas" : "",
    (previous?.answer?.blocks?.length ?? 0) > 0 ? "los bloques" : "",
  ].filter((part) => part !== "");

  return (
    <article ref={ref} className="break-inside-avoid-page rounded-xl border border-gray-200 print:border-0 print:border-b print:rounded-none">
      <header className="space-y-1 border-b border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-900">{anchorLabel(question.anchor)}</span>
          <span className="text-gray-600">{KIND_LABEL[question.kind]}</span>
          <QuestionStatusBadge status={question.answered ? (question.status ?? "ok") : "empty"} />
        </div>
        <h3 className="font-medium leading-snug text-gray-900">{withYears(question.text, year)}</h3>
      </header>

      {question.answered && (
        <div className="space-y-3 p-4">
          {question.warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              {question.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {warning}
                </li>
              ))}
            </ul>
          )}

          {!canSee || failed ? null : !detail || !draw ? (
            <p className="flex items-center gap-2 py-4 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Cargando la respuesta…
            </p>
          ) : detail.answer ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm" role="group" aria-label="Cómo ver la respuesta">
                  {(["digital", "excel"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMode(option)}
                      aria-pressed={mode === option}
                      className={clsx(
                        "px-3 py-1",
                        mode === option ? "bg-[var(--pantone-7421)] text-white" : "bg-white text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      {option === "digital" ? "Vista digital" : "Como en el Excel"}
                    </button>
                  ))}
                </div>
                {detail.question.template.instructions.length > 0 && (
                  <details className="text-sm text-gray-700">
                    <summary className="cursor-pointer text-[var(--pantone-7421)]">
                      Instrucciones ({detail.question.template.instructions.length})
                    </summary>
                    <ul className="mt-2 max-w-3xl list-disc space-y-1 pl-5 text-xs text-gray-600">
                      {detail.question.template.instructions.map((text, i) => (
                        <li key={i}>{withYears(text, year)}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>

              <DigitalAnswer
                template={detail.question.template}
                answer={detail.answer}
                anchor={question.anchor}
                editionYear={year}
                rowSources={detail.row_sources}
                mode={mode}
                previous={previous?.answer ? { year: previous.year, values: previous.answer.fields } : undefined}
              />

              {previous && (
                <div className="space-y-2 text-xs text-gray-600 print:hidden">
                  <p>
                    {previous.anchor === question.anchor
                      ? `En ${previous.year} tenía el mismo número`
                      : `En ${previous.year} era ${anchorPhrase(previous.anchor)}`}
                    {previous.answer
                      ? previous.same_institution
                        ? "."
                        : `; ese año la contestó ${previous.institution ?? "otra institución"}.`
                      : "; de ese año no hay respuesta importada."}
                  </p>
                  {previous.answer && previousApart.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-sm text-[var(--pantone-7421)]">
                        Ver {previousApart.join(" y ")} que se respondieron en {previous.year}
                      </summary>
                      <div className="mt-2">
                        <DigitalAnswer
                          template={previous.template}
                          answer={{ ...previous.answer, fields: {}, comment: null }}
                          anchor={previous.anchor}
                          editionYear={previous.year}
                          mode="digital"
                        />
                      </div>
                    </details>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-600">Esta institución no tiene respuesta importada para esta pregunta.</p>
          )}
        </div>
      )}
    </article>
  );
}
