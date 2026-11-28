import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, ChevronRight, History, TriangleAlert } from "lucide-react";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { useAuthContext } from "../../context/AuthContext";
import { KIND_LABEL, anchorLabel, withYears } from "../../lib/compiledTemplate";
import { getFileAnswers } from "./Answers.service";
import type { AnswerQuestionRow, FileAnswersPreview } from "./Answers.types";
import { ChangeBadge, QuestionStatusBadge } from "./components/AnswerBadges";
import { FileAnswersPanel } from "./components/FileAnswersPanel";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { apiErrorMessage, isCanceled } from "./Workbooks.service";
import { captureSummary } from "./answerLabels";
import { formatDateTime } from "./workbookLabels";

const POLL_MS = 3000;

type Filter = "all" | "answered" | "warning" | "error" | "empty" | "changes";

const FILTERS: { key: Filter; label: string; match: (q: AnswerQuestionRow) => boolean }[] = [
  { key: "all", label: "Todas", match: () => true },
  { key: "answered", label: "Contestadas", match: (q) => q.status === "ok" || q.status === "warning" },
  { key: "warning", label: "Con avisos", match: (q) => q.status === "warning" },
  { key: "error", label: "No se leyeron", match: (q) => q.status === "error" },
  { key: "empty", label: "En blanco", match: (q) => q.status === "empty" },
  { key: "changes", label: "Con cambios", match: (q) => q.change !== null && q.change !== "same" },
];

/**
 * Vista previa de las respuestas de un archivo (docs/CARGA_CENSOS.md, §7.1, paso 6):
 * cómo quedó la lectura de cada pregunta y, si ya había respuestas de ese cuaderno,
 * qué cambia. Aquí no hay valores: se ven por pregunta, con su permiso.
 */
export default function WorkbookAnswersPage() {
  const { id = "" } = useParams();
  const { hasPermission } = useAuthContext();
  const canSeeValues = hasPermission("workbook-answers.view");

  const [preview, setPreview] = useState<FileAnswersPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getFileAnswers(id, controller.signal)
      .then((data) => {
        setPreview(data);
        setError(null);
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(
          (err as { status?: number })?.status === 404
            ? "Este archivo no existe."
            : apiErrorMessage(err, "No se pudieron cargar las respuestas del archivo."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadToken]);

  // Mientras el archivo se vuelve a leer, la pantalla consulta sola.
  const pending = preview?.file.answers.status === "pending";
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setReloadToken((t) => t + 1), POLL_MS);
    return () => clearTimeout(timer);
  }, [pending, preview]);

  const counts = useMemo(() => {
    const questions = preview?.questions ?? [];
    return Object.fromEntries(FILTERS.map((f) => [f.key, questions.filter(f.match).length])) as Record<Filter, number>;
  }, [preview]);

  const file = preview?.file;
  const year = file?.workbook?.year ?? new Date().getFullYear();
  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible = (preview?.questions ?? []).filter(active.match);
  const hasDiff = preview?.against != null;
  // La copia exacta de otro archivo muestra las respuestas del original.
  const fileId = file?.id ?? id;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader subtitle="Lo que el sistema leyó de las celdas de captura del archivo. Nada entra al censo hasta que alguien confirma." />

      <div className="space-y-5 p-4 md:p-6">
        <Link
          to={`/admin/cuadernos/archivos/${fileId}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--pantone-7421)] hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al archivo
        </Link>

        {loading && <Loading />}
        {!loading && error && <ValidationError message={error} />}

        {!loading && !error && preview && file && (
          <>
            <div>
              <h2 className="break-words text-lg font-semibold text-gray-900">{file.original_name}</h2>
              {file.workbook && (
                <p className="text-sm text-gray-600">
                  {file.workbook.program} {file.workbook.year} · Módulo {file.workbook.module_number}
                  {file.workbook.module_name ? ` · ${file.workbook.module_name}` : ""} ·{" "}
                  <span className="font-mono text-xs">{file.workbook.code}</span>
                </p>
              )}
            </div>

            <FileAnswersPanel
              file={file}
              showLink={false}
              onChange={() => setReloadToken((t) => t + 1)}
            />

            {preview.against && preview.changes && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950">
                <History size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Ya hay respuestas de este cuaderno en el censo (versión {preview.against.version}, de{" "}
                  <Link to={`/admin/cuadernos/archivos/${preview.against.id}`} className="font-medium underline">
                    «{preview.against.original_name}»
                  </Link>
                  , importadas el {formatDateTime(preview.against.imported_at)}). Frente a ellas, este archivo{" "}
                  {changesSummary(preview.changes)}.
                </p>
              </div>
            )}

            {preview.questions.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar preguntas">
                  {FILTERS.filter((f) => f.key !== "changes" || hasDiff).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      aria-pressed={filter === f.key}
                      className={clsx(
                        "rounded-full border px-3 py-1 text-sm transition",
                        filter === f.key
                          ? "border-[var(--pantone-7421)] bg-[var(--pantone-7421)] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[var(--pantone-7421)]",
                      )}
                    >
                      {f.label} <span className="tabular-nums opacity-80">{counts[f.key]}</span>
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Núm.</Th>
                        <Th>Pregunta</Th>
                        <Th>Tipo</Th>
                        <Th>Lectura</Th>
                        {hasDiff && <Th>Frente a lo vigente</Th>}
                        {canSeeValues && <th scope="col" className="px-4 py-2"><span className="sr-only">Ver respuestas</span></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visible.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                            Ninguna pregunta en este filtro.
                          </td>
                        </tr>
                      )}
                      {visible.map((question) => (
                        <tr key={question.id} className="align-top hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="font-mono text-xs text-gray-900">{anchorLabel(question.anchor)}</span>
                            {question.section_number !== null && (
                              <span className="block text-xs text-gray-500">Sección {question.section_number}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="line-clamp-2 max-w-2xl text-gray-900" title={withYears(question.text, year)}>
                              {withYears(question.text, year)}
                            </p>
                            {question.warnings.length > 0 && (
                              <ul className="mt-1 space-y-0.5">
                                {question.warnings.map((warning, i) => (
                                  <li
                                    key={i}
                                    className={clsx(
                                      "flex items-start gap-1.5 text-xs",
                                      question.status === "error" ? "text-red-800" : "text-amber-900",
                                    )}
                                  >
                                    <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700">{KIND_LABEL[question.kind]}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <QuestionStatusBadge status={question.status} />
                            {question.filled > 0 && (
                              <span className="mt-1 block text-xs text-gray-500">
                                {captureSummary(question.filled, question.list_rows)}
                              </span>
                            )}
                          </td>
                          {hasDiff && (
                            <td className="whitespace-nowrap px-4 py-3">
                              {question.change ? <ChangeBadge change={question.change} /> : <span className="text-gray-400">—</span>}
                            </td>
                          )}
                          {canSeeValues && (
                            <td className="px-4 py-3 text-right">
                              {question.status !== "empty" || question.change === "removed" ? (
                                <Link
                                  to={`/admin/cuadernos/archivos/${fileId}/respuestas/${question.id}`}
                                  className="inline-flex items-center gap-0.5 whitespace-nowrap text-sm font-medium text-[var(--pantone-7421)] hover:underline"
                                  aria-label={`Ver las respuestas de la pregunta ${anchorLabel(question.anchor)}`}
                                >
                                  Ver
                                  <ChevronRight size={16} aria-hidden="true" />
                                </Link>
                              ) : null}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!canSeeValues && (
                  <p className="text-xs text-gray-500">
                    Para ver lo que se contestó en cada pregunta hace falta el permiso de respuestas de los cuadernos.
                  </p>
                )}
              </>
            )}

            {preview.questions.length === 0 && file.answers.status !== "pending" && (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                Todavía no hay una lectura de las respuestas de este archivo.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: string }) {
  return (
    <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}

function changesSummary(changes: Record<"new" | "changed" | "same" | "removed", number>): string {
  const parts = [
    changes.changed > 0 ? `cambia ${changes.changed}` : null,
    changes.new > 0 ? `agrega ${changes.new}` : null,
    changes.removed > 0 ? `deja en blanco ${changes.removed}` : null,
  ].filter(Boolean);
  const same = changes.same > 0 ? `${changes.same} ${changes.same === 1 ? "queda igual" : "quedan iguales"}` : null;

  if (parts.length === 0) return same ? `no cambia ninguna pregunta (${same})` : "no cambia nada";
  return `${parts.join(", ")} ${parts.length === 1 && /\b1$/.test(parts[0]!) ? "pregunta" : "preguntas"}${same ? `; ${same}` : ""}`;
}
