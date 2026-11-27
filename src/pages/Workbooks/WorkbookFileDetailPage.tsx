import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Copy, RotateCcw, TriangleAlert, Users } from "lucide-react";
import Loading from "../../components/Loading";
import { ValidationError } from "../../components/ValidationError";
import { useAuthContext } from "../../context/AuthContext";
import { FileAnswersPanel } from "./components/FileAnswersPanel";
import { FileStatusBadge } from "./components/FileStatusBadge";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import {
  apiErrorMessage,
  getWorkbookFile,
  getWorkbookInformants,
  isCanceled,
  retryWorkbookFile,
} from "./Workbooks.service";
import type { Informant, WorkbookFileDetail } from "./Workbooks.types";
import {
  FILL_LABEL,
  INFORMANT_POSITION_LABEL,
  KIND_LABEL,
  STATUS_HELP,
  TEMPLATE_LABEL,
  formatBytes,
  formatDateTime,
  sectionLabel,
} from "./workbookLabels";

const POLL_MS = 3000;

export default function WorkbookFileDetailPage() {
  const { id = "" } = useParams();
  const { hasPermission } = useAuthContext();

  const [file, setFile] = useState<WorkbookFileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [shownId, setShownId] = useState(id);

  // Al pasar a otro archivo (p. ej. del duplicado a su original) no se muestra el anterior.
  if (shownId !== id) {
    setShownId(id);
    setFile(null);
    setLoading(true);
    setError(null);
    setRetryError(null);
  }

  useEffect(() => {
    const controller = new AbortController();
    getWorkbookFile(id, controller.signal)
      .then((data) => {
        setFile(data);
        setError(null);
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(
          (err as { status?: number })?.status === 404
            ? "Este archivo no existe."
            : apiErrorMessage(err, "No se pudo cargar el archivo."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadToken]);

  // Mientras se identifica o se leen sus respuestas, vuelve a consultar.
  const pending = file?.status === "queued" || file?.status === "processing" || file?.answers.status === "pending";
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setReloadToken((t) => t + 1), POLL_MS);
    return () => clearTimeout(timer);
  }, [pending, file]);

  const retry = useCallback(async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      setFile(await retryWorkbookFile(id));
    } catch (err) {
      setRetryError(apiErrorMessage(err, "No se pudo reintentar."));
    } finally {
      setRetrying(false);
    }
  }, [id]);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader />

      <div className="space-y-6 p-4 md:p-6">
        <Link to="/admin/cuadernos" className="inline-flex items-center gap-1 text-sm text-[var(--pantone-7421)] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a la recepción
        </Link>

        {loading && <Loading />}
        {!loading && error && <ValidationError message={error} />}

        {!loading && !error && file && (
          <>
            <FileSummary file={file} />

            {file.duplicate_of && (
              <Notice icon={<Copy size={18} aria-hidden="true" />} tone="amber">
                Es una copia exacta de{" "}
                <Link to={`/admin/cuadernos/archivos/${file.duplicate_of.id}`} className="font-medium underline">
                  «{file.duplicate_of.original_name}»
                </Link>
                , recibido el {formatDateTime(file.duplicate_of.created_at)}. No se procesó otra vez.
              </Notice>
            )}

            {(file.status === "failed" || file.status === "unrecognized") && (
              <div className="space-y-2">
                <ValidationError message={file.error ?? STATUS_HELP[file.status]} />
                {hasPermission("workbooks.import") && file.can_retry && (
                  <button
                    type="button"
                    onClick={retry}
                    disabled={retrying}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--pantone-7421)] px-3 py-1.5 text-sm font-medium text-[var(--pantone-7421)] hover:bg-[#F7F3E8] disabled:opacity-50"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    {retrying ? "Enviando…" : "Volver a identificar"}
                  </button>
                )}
                {retryError && <p className="text-sm text-red-700">{retryError}</p>}
              </div>
            )}

            {file.identification && file.identification.warnings.length > 0 && (
              <Notice icon={<TriangleAlert size={18} aria-hidden="true" />} tone="amber">
                <p className="font-medium">Avisos de la identificación</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {file.identification.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </Notice>
            )}

            {file.workbook && <Identification file={file} />}

            {file.workbook && <FileAnswersPanel key={file.id} file={file} onChange={setFile} />}

            {file.identification && file.identification.sections.length > 0 && <SectionsTable file={file} />}

            {hasPermission("informants.view") && file.informants_count > 0 && (
              <InformantsPanel key={file.id} fileId={file.id} count={file.informants_count} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────── partes ──

function FileSummary({ file }: { file: WorkbookFileDetail }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h2 className="break-words text-lg font-semibold text-gray-900">{file.original_name}</h2>
        <p className="text-sm text-gray-600">
          {formatBytes(file.size_bytes)} · .{file.extension} · recibido el {formatDateTime(file.created_at)}
          {file.uploaded_by && ` por ${file.uploaded_by}`}
        </p>
        <p className="mt-1 font-mono text-xs text-gray-500" title={`Huella SHA-256: ${file.sha256}`}>
          Huella {file.sha256.slice(0, 16)}…
        </p>
      </div>
      <div className="shrink-0">
        <FileStatusBadge status={file.status} />
      </div>
    </div>
  );
}

function Identification({ file }: { file: WorkbookFileDetail }) {
  const workbook = file.workbook!;
  const entity = file.identification?.entity;

  const facts: { label: string; value: ReactNode }[] = [
    { label: "Edición", value: `${workbook.program} ${workbook.year}` },
    {
      label: "Módulo",
      value: `${workbook.module_number}${workbook.module_name ? ` · ${workbook.module_name}` : ""}`,
    },
    {
      label: "Tipo",
      value:
        workbook.kind === "anexo"
          ? `${KIND_LABEL.anexo}${workbook.parent_code ? ` de ${workbook.parent_code}` : " (todavía sin cuaderno principal)"}`
          : KIND_LABEL.principal,
    },
    { label: "Llenado", value: file.fill_state ? FILL_LABEL[file.fill_state] : "—" },
    {
      label: "Entidad",
      value: entity?.name ? `${entity.name}${entity.code ? ` (clave ${entity.code})` : ""}` : "—",
    },
    { label: "Preguntas", value: file.question_count ?? workbook.question_count },
    { label: "Código del cuaderno", value: <span className="font-mono">{workbook.code}</span> },
    {
      label: "Plantilla",
      value: (
        <Link
          to={`/admin/cuadernos/plantillas/${encodeURIComponent(workbook.code)}`}
          className="text-[var(--pantone-7421)] hover:underline"
        >
          {TEMPLATE_LABEL[workbook.template_status]}
        </Link>
      ),
    },
    {
      label: "Institución declarada",
      value: file.institution.declared ? (
        <>
          {file.institution.declared}
          <span className="block text-xs text-gray-500">
            {file.institution.resolved
              ? `Registrada como «${file.institution.resolved}»`
              : "No coincide con ninguna institución registrada; se liga abajo, en «Respuestas»."}
          </span>
        </>
      ) : (
        "—"
      ),
    },
  ];

  return (
    <section aria-labelledby="identificacion">
      <h3 id="identificacion" className="mb-2 font-semibold text-gray-800">
        Lo que se leyó del archivo
      </h3>
      <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs uppercase tracking-wide text-gray-500">{fact.label}</dt>
            <dd className="text-sm text-gray-900">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {file.identification?.census_title && (
        <p className="mt-2 text-xs text-gray-500">Encabezado del cuaderno: {file.identification.census_title}</p>
      )}
      {file.identification && file.identification.extra_sheets.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Hojas adicionales (complementos, anexos, listas): {file.identification.extra_sheets.join(", ")}
        </p>
      )}
    </section>
  );
}

function SectionsTable({ file }: { file: WorkbookFileDetail }) {
  const sections = file.identification!.sections;

  return (
    <section aria-labelledby="secciones">
      <h3 id="secciones" className="mb-2 font-semibold text-gray-800">
        Secciones y preguntas
      </h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Sección", "Nombre", "Hojas", "Preguntas"].map((label) => (
                <th key={label} scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sections.map((section) => (
              <tr key={section.number ?? "modulo"} className="align-top">
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">{sectionLabel(section.number)}</td>
                <td className="px-4 py-2 text-gray-900">{section.name ?? "—"}</td>
                <td className="px-4 py-2 text-gray-600">{section.sheets.length}</td>
                <td className="px-4 py-2">
                  <details>
                    <summary className="cursor-pointer tabular-nums text-gray-900">
                      {section.questions}
                    </summary>
                    <p className="mt-1 max-w-md text-xs text-gray-600">{section.anchors.join(" · ") || "Sin preguntas reconocibles"}</p>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Los contactos se piden solo cuando alguien decide verlos: son datos personales. */
function InformantsPanel({ fileId, count }: { fileId: string; count: number }) {
  const [informants, setInformants] = useState<Informant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setInformants(await getWorkbookInformants(fileId));
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudieron cargar los informantes."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="informantes" className="rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="informantes" className="flex items-center gap-2 font-semibold text-gray-800">
          <Users size={18} aria-hidden="true" />
          Informantes declarados ({count})
        </h3>
        {informants === null && (
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--pantone-7421)] hover:underline disabled:opacity-50"
          >
            {loading ? "Cargando…" : "Mostrar contactos"}
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Son datos personales protegidos: no los copies fuera del sistema.
      </p>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {informants && (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Persona", "Nombre", "Institución", "Cargo", "Teléfono", "Correo"].map((label) => (
                  <th key={label} scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {informants.map((person) => (
                <tr key={person.position} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">{INFORMANT_POSITION_LABEL(person.position)}</td>
                  <td className="px-3 py-2 text-gray-900">
                    {[person.title, person.name, person.first_surname, person.second_surname].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {person.declared_institution ?? "—"}
                    {person.institution && (
                      <span className="block text-xs text-gray-500">Registrada: {person.institution}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{person.job_title ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-700">{person.phone ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-700">{person.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Notice({ icon, tone, children }: { icon: ReactNode; tone: "amber"; children: ReactNode }) {
  const tones = { amber: "border-amber-300 bg-amber-50 text-amber-900" };
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${tones[tone]}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}
