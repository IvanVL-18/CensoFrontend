import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronRight, RotateCcw, TriangleAlert, Upload } from "lucide-react";
import { useAuthContext } from "../../../context/AuthContext";
import { extractFileAnswers, importFileAnswers } from "../Answers.service";
import type { ImportReport } from "../Answers.types";
import { apiErrorMessage } from "../Workbooks.service";
import type { WorkbookFileDetail } from "../Workbooks.types";
import { VIA_LABEL, reportSummary } from "../answerLabels";
import { formatDateTime } from "../workbookLabels";
import { AnswersStatusBadge } from "./AnswerBadges";
import { InstitutionPicker } from "./InstitutionPicker";

interface FileAnswersPanelProps {
  file: WorkbookFileDetail;
  /** El archivo cambió (institución, lectura o importación): la página lo vuelve a mostrar. */
  onChange: (file: WorkbookFileDetail) => void;
  /** En la página de respuestas no hace falta el enlace a sí misma. */
  showLink?: boolean;
}

/**
 * Respuestas de un archivo (docs/CARGA_CENSOS.md, §7.5): qué se leyó, de qué
 * institución son y el botón para que una persona confirme la importación.
 * Aquí solo hay conteos; los valores se ven por pregunta, con su permiso.
 */
export function FileAnswersPanel({ file, onChange, showLink = true }: FileAnswersPanelProps) {
  const { hasPermission } = useAuthContext();
  const canImport = hasPermission("workbooks.import");

  const [picking, setPicking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { answers, institution } = file;
  const detail = file.answers_detail;
  const status = answers.status;

  if (file.duplicate_of) return null;
  if (status === null && !detail?.unsupported && file.fill_state !== "blank") return null;

  const doImport = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await importFileAnswers(file.id);
      setNotice(importMessage(result.report));
      setConfirming(false);
      onChange(result.data);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudieron importar las respuestas."));
    } finally {
      setBusy(false);
    }
  };

  const doExtract = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      onChange(await extractFileAnswers(file.id));
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo volver a leer el archivo."));
    } finally {
      setBusy(false);
    }
  };

  const canChangeInstitution = canImport && status !== "imported" && status !== "superseded" && status !== null;
  const answered = answers.report ? answers.report.ok + answers.report.warning : 0;

  return (
    <section aria-labelledby="respuestas" className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="respuestas" className="font-semibold text-gray-800">
          Respuestas
        </h3>
        {status && <AnswersStatusBadge status={status} version={answers.version} />}
      </div>

      {status === null && file.fill_state === "blank" && (
        <p className="text-sm text-gray-700">Es un cuaderno en blanco: no trae nada escrito en sus celdas de captura.</p>
      )}
      {status === null && file.fill_state !== "blank" && detail?.unsupported && (
        <p className="text-sm text-gray-700">{detail.unsupported}</p>
      )}

      {status === "pending" && (
        <p className="text-sm text-gray-700">
          Se están leyendo las respuestas del archivo. Esta pantalla se actualiza sola.
        </p>
      )}

      {status === "failed" && (
        <p className="text-sm text-red-700">{answers.error ?? "No se pudieron leer las respuestas del archivo."}</p>
      )}

      {answers.report && status !== null && status !== "pending" && status !== "failed" && (
        <p className="text-sm text-gray-800">
          {reportSummary(answers.report)}
          <span className="block text-xs text-gray-500">
            {answers.report.filled.toLocaleString("es-MX")} celdas con respuesta · leídas el {formatDateTime(answers.extracted_at)}
          </span>
        </p>
      )}

      {status === "same" && answers.same_as && (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
          Trae exactamente las mismas respuestas que{" "}
          <Link to={`/admin/cuadernos/archivos/${answers.same_as.id}`} className="font-medium text-[var(--pantone-7421)] underline">
            «{answers.same_as.original_name}»
          </Link>
          {answers.same_as.status === "imported" ? ", que ya están en el censo" : ", recibido antes"}. No hay nada que importar.
        </p>
      )}

      {status === "imported" && (
        <p className="text-sm text-gray-700">
          Son las respuestas vigentes en el censo.
          <span className="block text-xs text-gray-500">
            Importadas el {formatDateTime(answers.imported_at)}
            {detail?.imported_by ? ` por ${detail.imported_by}` : ""}
          </span>
        </p>
      )}

      {status === "superseded" && (
        <p className="text-sm text-gray-700">
          Estuvieron en el censo y después las sustituyó una versión más nueva. Se conservan aquí como registro.
          <span className="block text-xs text-gray-500">Importadas el {formatDateTime(answers.imported_at)}</span>
        </p>
      )}

      {/* Institución: sin ella no se importa. */}
      {status !== null && status !== "pending" && status !== "failed" && (
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-gray-50 p-3 text-sm">
          <p className="flex items-start gap-2 text-gray-800">
            <Building2 size={16} className="mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
            {institution.resolved ? (
              <span>
                Son de <span className="font-medium">{institution.resolved}</span>
                {institution.via && <span className="block text-xs text-gray-500">Ligada {VIA_LABEL[institution.via]}</span>}
              </span>
            ) : (
              <span className="text-amber-900">
                <span className="font-medium">Falta ligar la institución.</span>
                <span className="block text-xs">
                  {institution.declared
                    ? `«${institution.declared}» no coincide con ninguna del catálogo.`
                    : "El archivo no declara ninguna."}
                </span>
              </span>
            )}
          </p>
          {canChangeInstitution && !picking && (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="shrink-0 text-sm font-medium text-[var(--pantone-7421)] hover:underline"
            >
              {institution.resolved ? "Cambiar" : "Elegir institución"}
            </button>
          )}
        </div>
      )}

      {picking && (
        <InstitutionPicker
          fileId={file.id}
          onCancel={() => setPicking(false)}
          onAssigned={(updated, linked) => {
            setPicking(false);
            setNotice(
              linked > 0
                ? `Institución ligada. Por el nombre recordado se ${linked === 1 ? "ligó 1 archivo más" : `ligaron ${linked} archivos más`}.`
                : "Institución ligada.",
            );
            onChange(updated);
          }}
        />
      )}

      {notice && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-900">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Confirmación: nada entra al censo sin que una persona lo diga. */}
      {status === "extracted" && canImport && !picking && (
        <div className="space-y-2">
          {detail?.blocker ? (
            <p className="text-sm text-gray-700">Para importar: {lowerFirst(detail.blocker)}</p>
          ) : confirming ? (
            <div className="space-y-2 rounded-lg border border-[var(--pantone-7421)] bg-[#F7F3E8] p-3">
              <p className="text-sm text-gray-900">
                Se van a importar {answered.toLocaleString("es-MX")} {answered === 1 ? "respuesta" : "respuestas"} de{" "}
                <span className="font-medium">{institution.resolved}</span> al censo de {file.workbook?.program}{" "}
                {file.workbook?.year}. Si ya había respuestas de este cuaderno, se actualizan las que cambiaron.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={doImport}
                  disabled={busy}
                  className="rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "Importando…" : "Sí, importar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                  className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setConfirming(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Upload size={16} aria-hidden="true" />
              Importar respuestas
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {showLink && answers.report && status !== null && status !== "pending" && (
          <Link
            to={`/admin/cuadernos/archivos/${file.id}/respuestas`}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--pantone-7421)] hover:underline"
          >
            Ver la lectura pregunta por pregunta
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
        {canImport && (status === "failed" || status === "extracted" || status === "same") && (
          <button
            type="button"
            onClick={doExtract}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:underline disabled:opacity-50"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Volver a leer el archivo
          </button>
        )}
      </div>
    </section>
  );
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function importMessage(report: ImportReport): string {
  const parts = [
    report.created > 0 ? `${report.created} nuevas` : null,
    report.updated > 0 ? `${report.updated} actualizadas` : null,
    report.unchanged > 0 ? `${report.unchanged} sin cambio` : null,
    report.removed > 0 ? `${report.removed} quedaron en blanco` : null,
    report.skipped > 0 ? `${report.skipped} no se pudieron leer y no se tocaron` : null,
  ].filter(Boolean);

  return `Respuestas importadas (versión ${report.version}): ${parts.join(", ")}.`;
}
