import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, CircleCheck } from "lucide-react";
import CompiledGrid from "../../components/CompiledGrid";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { useAuthContext } from "../../context/AuthContext";
import {
  FIELD_TYPE_LABEL,
  KIND_LABEL,
  allFields,
  anchorLabel,
  anchorPhrase,
  blockTitle,
  continuationNote,
  diffFields,
  diffWords,
  fieldLabel,
  withYears,
  type TemplateField,
  type TemplateList,
} from "../../lib/compiledTemplate";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { AnsweredSourceNotice, FlagList, MatchBadge, ReviewBadge } from "./components/TemplateBadges";
import { approveTemplateQuestion, getTemplateQuestion, getWorkbookTemplate } from "./Templates.service";
import type { CellPosition, ListCellMap, TemplateQuestionDetail, TemplateQuestionRow } from "./Templates.types";
import { apiErrorMessage, isCanceled } from "./Workbooks.service";
import { formatDateTime } from "./workbookLabels";

/**
 * Una pregunta compilada (docs/CARGA_CENSOS.md, §7.3 y §7.4): su texto, sus
 * campos, cómo viene en el Excel y qué cambió frente a la edición con la que se
 * casó. Aquí se aprueba.
 */
export default function WorkbookTemplateQuestionPage() {
  const { code = "", id = "" } = useParams<{ code: string; id: string }>();
  const { hasPermission } = useAuthContext();
  const canApprove = hasPermission("workbooks.import");

  const [question, setQuestion] = useState<TemplateQuestionDetail | null>(null);
  const [siblings, setSiblings] = useState<TemplateQuestionRow[]>([]);
  /** La plantilla del cuaderno se armó con un contestado. */
  const [fromAnswered, setFromAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setQuestion(null);
    setError(null);
    getTemplateQuestion(id, controller.signal)
      .then(setQuestion)
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(apiErrorMessage(err, "No se pudo cargar la pregunta."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  // La lista del cuaderno, para pasar a la pregunta anterior o a la siguiente.
  useEffect(() => {
    const controller = new AbortController();
    getWorkbookTemplate(code, controller.signal)
      .then((summary) => {
        setSiblings(summary.questions);
        setFromAnswered(summary.workbook.report?.blank === false);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [code]);

  const approve = async () => {
    setApproving(true);
    try {
      setQuestion(await approveTemplateQuestion(id));
      setSiblings((list) => list.map((q) => (String(q.id) === id ? { ...q, review_status: "approved" } : q)));
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo aprobar la pregunta."));
    } finally {
      setApproving(false);
    }
  };

  const position = siblings.findIndex((q) => String(q.id) === id);
  const previousSibling = position > 0 ? siblings[position - 1] : null;
  const nextSibling = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;
  const nextPending = siblings.find((q, index) => index > position && q.review_status === "pending") ?? null;
  const base = `/admin/cuadernos/plantillas/${encodeURIComponent(code)}`;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader />

      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={base} className="inline-flex items-center gap-1.5 text-sm text-[var(--pantone-7421)] hover:underline">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a la plantilla de {code}
          </Link>
          {siblings.length > 0 && position >= 0 && (
            <nav className="flex items-center gap-2 text-sm text-gray-600" aria-label="Otras preguntas del cuaderno">
              <SiblingLink to={previousSibling ? `${base}/${previousSibling.id}` : null} label="Anterior" icon="left" />
              <span className="tabular-nums">
                {position + 1} de {siblings.length}
              </span>
              <SiblingLink to={nextSibling ? `${base}/${nextSibling.id}` : null} label="Siguiente" icon="right" />
            </nav>
          )}
        </div>

        {loading && <Loading />}
        {error && <ValidationError message={error} />}

        {question && (
          <>
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-800">{anchorLabel(question.anchor)}</span>
                <span className="text-sm text-gray-600">{KIND_LABEL[question.kind]}</span>
                <MatchBadge status={question.match_status} />
                <ReviewBadge status={question.review_status} />
              </div>
              <h2 className="text-lg font-semibold leading-snug text-gray-900">{question.text}</h2>
              <p className="text-xs text-gray-500">
                {question.workbook.program} {question.workbook.year}
                {question.placement?.section ? ` · ${question.placement.section}` : ""} · hoja{" "}
                <span className="font-mono">{question.sheet}</span>
                {question.template.belongs_to ? ` · ${continuationNote(question.template)}` : ""}
              </p>
              <FlagList flags={question.flags} />
              {fromAnswered && <AnsweredSourceNotice />}

              {question.review_status === "pending" && canApprove && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={approve}
                    disabled={approving}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    <CircleCheck size={16} aria-hidden="true" />
                    {approving ? "Aprobando…" : "Aprobar esta pregunta"}
                  </button>
                  <span className="text-sm text-gray-600">Apruébala si los campos y sus etiquetas corresponden con el Excel.</span>
                </div>
              )}
              {question.review_status === "approved" && (
                <p className="text-sm text-green-800">
                  Aprobada{question.reviewed_by ? ` por ${question.reviewed_by}` : ""}
                  {question.reviewed_at ? ` el ${formatDateTime(question.reviewed_at)}` : ""}.
                  {nextPending && (
                    <>
                      {" "}
                      <Link to={`${base}/${nextPending.id}`} className="font-medium text-[var(--pantone-7421)] hover:underline">
                        Ir a la siguiente por revisar ({anchorLabel(nextPending.anchor)})
                      </Link>
                    </>
                  )}
                </p>
              )}
            </header>

            <Comparison question={question} />

            {question.template.instructions.length > 0 && (
              <details className="rounded-xl border border-gray-200 p-4">
                <summary className="cursor-pointer font-semibold text-gray-800">
                  Instrucciones ({question.template.instructions.length})
                </summary>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  {question.template.instructions.map((text, index) => (
                    <li key={index}>{withYears(text, question.workbook.year)}</li>
                  ))}
                </ul>
              </details>
            )}

            <section aria-labelledby="excel">
              <h3 id="excel" className="mb-2 font-semibold text-gray-800">
                Cómo viene en el Excel
              </h3>
              <CompiledGrid template={question.template} editionYear={question.workbook.year} />
              <p className="mt-2 text-xs text-gray-500">
                Las celdas punteadas son las de captura y dicen qué se escribe en ellas.
                {question.template.comment ? " La pregunta trae además un espacio para comentarios." : ""}
              </p>
            </section>

            <QuestionFields question={question} />
          </>
        )}
      </div>
    </div>
  );
}

function SiblingLink({ to, label, icon }: { to: string | null; label: string; icon: "left" | "right" }) {
  const Icon = icon === "left" ? ChevronLeft : ChevronRight;
  const content = (
    <>
      {icon === "left" && <Icon size={16} aria-hidden="true" />}
      {label}
      {icon === "right" && <Icon size={16} aria-hidden="true" />}
    </>
  );
  const className = "inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1";

  return to ? (
    <Link to={to} className={`${className} text-gray-700 hover:bg-gray-50`}>
      {content}
    </Link>
  ) : (
    <span className={`${className} cursor-not-allowed text-gray-400`} aria-disabled="true">
      {content}
    </span>
  );
}

/**
 * Diferencias con la pregunta de otra edición con la que se casó. Esa edición puede ser anterior o
 * posterior (los cuadernos se cargan en cualquier orden), así que nada aquí dice «antes» ni «ya no».
 */
function Comparison({ question }: { question: TemplateQuestionDetail }) {
  const previous = question.previous;

  const text = useMemo(
    () => (previous?.template ? diffWords(previous.template.text, question.template.text) : []),
    [previous, question.template.text],
  );
  // Se comparan también los campos del bloque repetido, si la pregunta lo trae.
  const fields = useMemo(
    () => (previous?.template ? diffFields(allFields(previous.template), allFields(question.template)) : null),
    [previous, question.template],
  );

  if (!previous) {
    return question.match_status === "new" ? (
      <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
        Es una pregunta nueva: no se parece a ninguna de las ediciones ya cargadas.
      </p>
    ) : null;
  }

  const where = `${anchorPhrase(previous.anchor)} de ${previous.year}`;
  if (question.match_status === "same") {
    return (
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        Es la misma pregunta que {where}: se reutiliza tal cual y sus respuestas se pueden comparar entre los dos años.
      </p>
    );
  }

  const textChanged = text.some((part) => part.type !== "same");
  const fieldsChanged = fields !== null && fields.added.length + fields.removed.length + fields.changed.length > 0;
  const year = question.workbook.year;

  return (
    <section aria-labelledby="comparacion" className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <h3 id="comparacion" className="font-semibold text-gray-800">
        Diferencias con {where}
        {question.similarity !== null && (
          <span className="ml-2 text-sm font-normal text-gray-600">
            (el texto se parece {Math.round(question.similarity * 100)} %)
          </span>
        )}
      </h3>

      {textChanged ? (
        <>
          <p className="text-sm leading-relaxed text-gray-800">
            {text.map((part, index) =>
              part.type === "same" ? (
                <span key={index}>{withYears(part.text, year)} </span>
              ) : part.type === "added" ? (
                <ins key={index} className="rounded bg-green-100 px-0.5 text-green-900 decoration-green-700">
                  {withYears(part.text, year)}{" "}
                </ins>
              ) : (
                <del key={index} className="rounded bg-red-100 px-0.5 text-red-900">
                  {withYears(part.text, previous.year)}{" "}
                </del>
              ),
            )}
          </p>
          <p className="text-xs text-gray-600">
            Resaltado, lo que solo dice la de {year}; tachado, lo que solo dice la de {previous.year}.
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-700">El texto es el mismo.</p>
      )}

      {fields && fieldsChanged ? (
        <ul className="space-y-1 text-sm text-gray-800">
          {fields.added.map((field) => (
            <li key={`a-${field.key}`}>
              <span className="font-medium text-green-800">Solo en {year}:</span> {describe(field, year)}
            </li>
          ))}
          {fields.removed.map((field) => (
            <li key={`r-${field.key}`}>
              <span className="font-medium text-red-800">Solo en {previous.year}:</span> {describe(field, previous.year)}
            </li>
          ))}
          {fields.changed.map(({ before, after }) => (
            <li key={`c-${after.key}`}>
              <span className="font-medium text-amber-900">Distinto:</span> {describe(after, year)} (en {previous.year},{" "}
              {FIELD_TYPE_LABEL[before.type].toLowerCase()}
              {before.options ? ` con ${before.options.length} opciones` : ""})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-700">
          {textChanged
            ? "Los campos son los mismos."
            : "Los campos tienen las mismas etiquetas; la forma de la tabla es distinta (por ejemplo, el número de filas o de columnas)."}
        </p>
      )}
    </section>
  );
}

function describe(field: TemplateField, year: number): string {
  const label = fieldLabel(field, year) || "(sin etiqueta)";
  return `${label} — ${FIELD_TYPE_LABEL[field.type].toLowerCase()}`;
}

/**
 * Los campos de la pregunta y, si trae bloques repetidos, los de un bloque, con la celda del
 * Excel de esta edición donde está cada uno.
 */
function QuestionFields({ question }: { question: TemplateQuestionDetail }) {
  const { template, cell_map: map } = question;
  const year = question.workbook.year;
  const { repeat } = template;
  const blocks = map.repeat;
  // Las posiciones de un bloque se cuentan desde su inicio: aquí, el del primero.
  const blockStart = blocks ? map.anchor_row + blocks.first_row : 0;

  return (
    <>
      <FieldsTable
        id="campos"
        title="Campos"
        fields={template.fields}
        lists={template.lists}
        year={year}
        cell={(field) => cellOf(field, map.anchor_row, map.fields, map.lists)}
      />
      {repeat && (
        <FieldsTable
          id="campos-bloque"
          title={`Campos de cada bloque («${repeat.title}»)`}
          note={
            `La pregunta trae ${repeat.count.toLocaleString("es-MX")} bloques con la misma forma.` +
            (blocks
              ? ` Las celdas son las de «${blockTitle(repeat, 1)}», que empieza en la fila ${blockStart}; cada bloque siguiente está ${blocks.stride} filas más abajo.`
              : "")
          }
          fields={repeat.fields}
          lists={repeat.lists}
          year={year}
          cell={(field) => (blocks ? cellOf(field, blockStart, blocks.fields, blocks.lists) : "—")}
        />
      )}
    </>
  );
}

interface FieldsTableProps {
  id: string;
  title: string;
  note?: string;
  fields: TemplateField[];
  /** Las tablas de lista a las que apunta `field.list`: las de la pregunta o las del bloque. */
  lists: TemplateList[];
  year: number;
  /** Celda o rango del Excel donde está el campo. */
  cell: (field: TemplateField) => string;
}

function FieldsTable({ id, title, note, fields, lists, year, cell }: FieldsTableProps) {
  if (fields.length === 0) {
    return null;
  }
  // Con muchos campos (matrices grandes) la tabla se pliega.
  const collapsed = fields.length > 30;

  const table = (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Campo", "Qué se captura", "Opciones", "Celda"].map((label) => (
              <th key={label} scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fields.map((field) => (
            <tr key={field.key} className="align-top">
              <td className="px-4 py-2 text-gray-900">
                {fieldLabel(field, year) || <span className="italic text-gray-500">La respuesta a la pregunta</span>}
                {field.list !== undefined && (
                  <span className="block text-xs text-gray-500">
                    Columna de la tabla de {lists[field.list]?.rows.toLocaleString("es-MX") ?? "varias"} filas
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">{FIELD_TYPE_LABEL[field.type]}</td>
              <td className="px-4 py-2 text-gray-700">
                {field.options && field.options.length > 0 ? (
                  <details>
                    <summary className="cursor-pointer text-[var(--pantone-7421)]">
                      {field.options.length === 1 ? "1 opción" : `${field.options.length} opciones`}
                    </summary>
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {field.options.map((option) => (
                        <li key={option.value}>
                          <span className="font-mono">{option.value}</span> · {option.label || <em className="text-amber-800">sin etiqueta</em>}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  "—"
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-gray-600">{cell(field)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="mb-2 font-semibold text-gray-800">
        {title} ({fields.length.toLocaleString("es-MX")})
      </h3>
      {note && <p className="mb-2 text-xs text-gray-500">{note}</p>}
      {collapsed ? (
        <details>
          <summary className="cursor-pointer text-sm text-[var(--pantone-7421)]">Ver la lista de campos</summary>
          <div className="mt-2">{table}</div>
        </details>
      ) : (
        table
      )}
    </section>
  );
}

/**
 * Celda o rango del Excel donde está el campo: «C14», o «D23:D27» en una tabla de lista. `base`
 * es la fila desde la que se cuentan las posiciones: la del ancla o la del inicio del bloque.
 * Un campo en varias casillas, o una tabla partida en dos mitades, da varias celdas o rangos.
 */
function cellOf(field: TemplateField, base: number, fields: Record<string, CellPosition>, lists: ListCellMap[]): string {
  const single = fields[field.key];
  if (single) {
    return [single, ...(single.more ?? [])].map((at) => `${at.col}${base + at.row}`).join(", ");
  }
  for (const list of lists) {
    const column = list.columns[field.key];
    if (column) {
      const first = base + list.first_row;
      const columns = [column, ...(list.parts?.[field.key] ?? []), ...(list.extra ?? []).map((half) => half[field.key])];
      return columns
        .filter(Boolean)
        .map((letter) => `${letter}${first}:${letter}${first + list.rows - 1}`)
        .join(", ");
    }
  }
  return "—";
}
