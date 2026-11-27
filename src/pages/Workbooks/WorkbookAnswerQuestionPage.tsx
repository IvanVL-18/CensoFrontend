import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, TriangleAlert } from "lucide-react";
import CompiledGrid from "../../components/CompiledGrid";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import {
  KIND_LABEL,
  SPECIAL_VALUE_LABEL,
  fieldLabel,
  formatAnswerValue,
  isSpecialValue,
  withYears,
  type AnswerRow,
  type AnswerValue,
  type CompiledAnswer,
  type CompiledTemplate,
  type TemplateField,
} from "../../lib/compiledTemplate";
import { getFileAnswer, getFileAnswers } from "./Answers.service";
import type { AnswerQuestionDetail, AnswerQuestionRow } from "./Answers.types";
import { ChangeBadge, QuestionStatusBadge } from "./components/AnswerBadges";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { apiErrorMessage, isCanceled } from "./Workbooks.service";
import { formatDateTime } from "./workbookLabels";

/**
 * Lo que se contestó en una pregunta de un archivo (docs/CARGA_CENSOS.md, §7.5) y,
 * si ya había respuestas vigentes de ese cuaderno, lo que decían. Son respuestas
 * confidenciales: la ruta y el endpoint piden workbook-answers.view.
 */
export default function WorkbookAnswerQuestionPage() {
  const { id = "", questionId = "" } = useParams();

  const [detail, setDetail] = useState<AnswerQuestionDetail | null>(null);
  const [siblings, setSiblings] = useState<AnswerQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(questionId);

  if (shown !== questionId) {
    setShown(questionId);
    setDetail(null);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    getFileAnswer(id, questionId, controller.signal)
      .then((data) => {
        setDetail(data);
        setError(null);
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        const status = (err as { status?: number })?.status;
        setError(
          status === 404
            ? "Este archivo no tiene respuestas leídas para esa pregunta."
            : status === 403
              ? "No tienes permiso para ver las respuestas de los cuadernos."
              : apiErrorMessage(err, "No se pudieron cargar las respuestas."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, questionId]);

  // La lista sirve para pasar a la pregunta anterior o a la siguiente que tenga algo que ver.
  useEffect(() => {
    const controller = new AbortController();
    getFileAnswers(id, controller.signal)
      .then((data) => setSiblings(data.questions.filter((q) => q.status !== "empty" || q.change === "removed")))
      .catch(() => undefined);
    return () => controller.abort();
  }, [id]);

  const position = siblings.findIndex((q) => String(q.id) === questionId);
  const previous = position > 0 ? siblings[position - 1] : null;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;
  const listUrl = `/admin/cuadernos/archivos/${id}/respuestas`;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader />

      <div className="space-y-5 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={listUrl} className="inline-flex items-center gap-1 text-sm text-[var(--pantone-7421)] hover:underline">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a las respuestas del archivo
          </Link>
          {position >= 0 && (
            <nav className="flex items-center gap-2 text-sm" aria-label="Otras preguntas del archivo">
              <Step to={previous ? `${listUrl}/${previous.id}` : null} label="Anterior" icon="left" />
              <span className="tabular-nums text-gray-500">
                {position + 1} de {siblings.length}
              </span>
              <Step to={next ? `${listUrl}/${next.id}` : null} label="Siguiente" icon="right" />
            </nav>
          )}
        </div>

        {loading && <Loading />}
        {!loading && error && <ValidationError message={error} />}

        {!loading && !error && detail && <Detail detail={detail} />}
      </div>
    </div>
  );
}

function Step({ to, label, icon }: { to: string | null; label: string; icon: "left" | "right" }) {
  const content = (
    <>
      {icon === "left" && <ChevronLeft size={16} aria-hidden="true" />}
      {label}
      {icon === "right" && <ChevronRight size={16} aria-hidden="true" />}
    </>
  );
  const className = "inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1";

  return to ? (
    <Link to={to} className={`${className} text-gray-800 hover:border-[var(--pantone-7421)]`}>
      {content}
    </Link>
  ) : (
    <span className={`${className} cursor-not-allowed text-gray-400`} aria-disabled="true">
      {content}
    </span>
  );
}

function Detail({ detail }: { detail: AnswerQuestionDetail }) {
  const { question, workbook, answer } = detail;
  const { template } = question;
  const year = workbook.year;
  const old = detail.previous?.answer ?? null;

  // Campos sueltos cuyo valor no es el de la versión vigente.
  const changed = useMemo(() => {
    const keys = new Set<string>();
    if (!detail.previous) return keys;
    for (const field of template.fields) {
      if (field.list === undefined && answer?.fields[field.key] !== old?.fields[field.key]) keys.add(field.key);
    }
    return keys;
  }, [detail.previous, template.fields, answer, old]);

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-900">{question.anchor}</span>
          <span className="text-gray-600">{KIND_LABEL[question.kind]}</span>
          <QuestionStatusBadge status={detail.status} />
          {detail.change && <ChangeBadge change={detail.change} />}
        </div>
        <h2 className="text-lg font-semibold leading-snug text-gray-900">{withYears(question.text, year)}</h2>
        <p className="text-xs text-gray-500">
          {workbook.code}
          {workbook.module_name ? ` · ${workbook.module_name}` : ""} · hoja{" "}
          <span className="font-mono">{question.sheet}</span>
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
        <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Respuestas confidenciales del cuestionario: no las copies fuera del sistema.
      </p>

      {detail.warnings.length > 0 && (
        <ul
          className={clsx(
            "space-y-1 rounded-lg border p-3 text-sm",
            detail.status === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-950",
          )}
        >
          {detail.warnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {warning}
            </li>
          ))}
        </ul>
      )}

      {answer ? (
        <Answer template={template} answer={answer} year={year} highlight={changed} other={detail.previous ? old : undefined} showNote />
      ) : (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          {detail.status === "error"
            ? "Esta pregunta no se pudo leer en este archivo. Si ya había una respuesta en el censo, no se toca."
            : "En este archivo la pregunta viene en blanco."}
        </p>
      )}

      {detail.previous && (
        <section aria-labelledby="vigente" className="space-y-3 rounded-xl border border-gray-200 p-4">
          <div>
            <h3 id="vigente" className="font-semibold text-gray-800">
              Lo que está vigente en el censo
            </h3>
            <p className="text-xs text-gray-500">
              Versión {detail.previous.file.version}, de{" "}
              <Link to={`/admin/cuadernos/archivos/${detail.previous.file.id}`} className="underline">
                «{detail.previous.file.original_name}»
              </Link>
              , importada el {formatDateTime(detail.previous.file.imported_at)}
            </p>
          </div>
          {detail.change === "same" ? (
            <p className="text-sm text-gray-700">Dice lo mismo que este archivo.</p>
          ) : old ? (
            <Answer template={template} answer={old} year={year} highlight={changed} other={answer} />
          ) : (
            <p className="text-sm text-gray-700">No había respuesta para esta pregunta.</p>
          )}
        </section>
      )}
    </>
  );
}

interface AnswerProps {
  template: CompiledTemplate;
  answer: CompiledAnswer;
  year: number;
  /** Claves de los campos sueltos que cambian entre versiones. */
  highlight: ReadonlySet<string>;
  /** La otra versión, para resaltar las filas de lista que no dicen lo mismo. Sin ella no se compara. */
  other?: CompiledAnswer | null;
  /** Explica debajo qué significan «—» y el resaltado. */
  showNote?: boolean;
}

/** Las respuestas de una pregunta: sus campos sueltos, sus tablas de lista y el comentario. */
function Answer({ template, answer, year, highlight, other, showNote = false }: AnswerProps) {
  const loose = template.fields.filter((field) => field.list === undefined);
  const pureGrid = template.lists.length === 0 && template.grid.rows.length > 0;
  const comparing = other !== undefined;

  return (
    <div className="space-y-4">
      {/* Sin tablas de lista, la pregunta se dibuja como en el Excel, con las respuestas en su lugar. */}
      {pureGrid && <CompiledGrid template={template} editionYear={year} values={answer.fields} highlight={highlight} />}

      {showNote && (pureGrid || comparing) && (
        <p className="text-xs text-gray-500">
          {pureGrid ? "Las celdas con «—» vienen en blanco. " : ""}
          {comparing ? "Lo resaltado no dice lo mismo en las dos versiones." : ""}
        </p>
      )}

      {!pureGrid && loose.length > 0 && <LooseFields fields={loose} values={answer.fields} year={year} highlight={highlight} />}

      {template.lists.map((list, index) => (
        <ListTable
          key={index}
          title={template.lists.length > 1 ? `Tabla ${index + 1}` : "Tabla"}
          total={list.rows}
          fields={list.fields
            .map((key) => template.fields.find((field) => field.key === key))
            .filter((field): field is TemplateField => field !== undefined)}
          rows={answer.lists[index] ?? []}
          otherRows={comparing ? (other?.lists[index] ?? []) : undefined}
          year={year}
        />
      ))}

      {answer.comment && (
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Comentario del informante</p>
          <p className="mt-1 whitespace-pre-line text-sm text-gray-900">{answer.comment}</p>
        </div>
      )}
    </div>
  );
}

function Value({ field, value }: { field: TemplateField; value: AnswerValue | undefined }) {
  const text = formatAnswerValue(field, value);
  if (text === "") return <span className="text-gray-400">—</span>;
  if (isSpecialValue(value)) {
    return (
      <span className="italic text-gray-700" title={SPECIAL_VALUE_LABEL[value]}>
        {value} <span className="text-xs not-italic text-gray-500">({SPECIAL_VALUE_LABEL[value].toLowerCase()})</span>
      </span>
    );
  }
  return <>{text}</>;
}

function LooseFields({
  fields,
  values,
  year,
  highlight,
}: {
  fields: TemplateField[];
  values: Record<string, AnswerValue>;
  year: number;
  highlight: ReadonlySet<string>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Campo
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Respuesta
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fields.map((field) => (
            <tr key={field.key} className={clsx("align-top", highlight.has(field.key) && "bg-amber-50")}>
              <th scope="row" className="px-4 py-2 text-left font-normal text-gray-700">
                {fieldLabel(field, year) || "Respuesta"}
              </th>
              <td className="px-4 py-2 font-medium text-gray-900">
                <Value field={field} value={values[field.key]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListTable({
  title,
  total,
  fields,
  rows,
  otherRows,
  year,
}: {
  title: string;
  total: number;
  fields: TemplateField[];
  rows: AnswerRow[];
  /** Filas de la otra versión; una fila se resalta si allá no está o dice otra cosa. */
  otherRows?: AnswerRow[];
  year: number;
}) {
  const others = new Map((otherRows ?? []).map((row) => [row._row, JSON.stringify(row)]));
  const differs = (row: AnswerRow) => otherRows !== undefined && others.get(row._row) !== JSON.stringify(row);

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-gray-800">
        {title}{" "}
        <span className="font-normal text-gray-500">
          · {rows.length.toLocaleString("es-MX")} de {total.toLocaleString("es-MX")} filas con respuesta
        </span>
      </p>
      {rows.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Sin filas contestadas.</p>
      ) : (
        <div className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fila
                </th>
                {fields.map((field) => (
                  <th key={field.key} scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                    {fieldLabel(field, year) || "Respuesta"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row._row} className={clsx("align-top", differs(row) && "bg-amber-50")}>
                  <td className="px-3 py-1.5 tabular-nums text-gray-500">{row._row}</td>
                  {fields.map((field) => (
                    <td key={field.key} className="px-3 py-1.5 text-gray-900">
                      <Value field={field} value={row[field.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
