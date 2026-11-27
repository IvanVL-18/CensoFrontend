import { Link } from "react-router-dom";
import { Eye, TriangleAlert } from "lucide-react";
import Loading from "../../../components/Loading";
import { ValidationError } from "../../../components/ValidationError";
import type { WorkbookFile } from "../Workbooks.types";
import {
  FILL_LABEL,
  KIND_LABEL,
  compactNumbers,
  formatBytes,
  formatDateTime,
} from "../workbookLabels";
import { FileStatusBadge } from "./FileStatusBadge";

interface WorkbookFilesTableProps {
  files: WorkbookFile[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
}

const COLUMNS = 6;

export function WorkbookFilesTable({ files, loading, error, emptyMessage }: WorkbookFilesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Archivo", "Cuaderno identificado", "Llenado", "Institución declarada", "Estado", ""].map((label, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {label || <span className="sr-only">Acciones</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {loading && (
            <tr>
              <td colSpan={COLUMNS} className="p-6 text-center">
                <Loading />
              </td>
            </tr>
          )}
          {!loading && error && (
            <tr>
              <td colSpan={COLUMNS} className="p-4">
                <ValidationError message={error} />
              </td>
            </tr>
          )}
          {!loading && !error && files.length === 0 && (
            <tr>
              <td colSpan={COLUMNS} className="p-6 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            !error &&
            files.map((file) => (
              <tr key={file.id} className="align-top hover:bg-gray-50">
                <td className="max-w-xs px-4 py-3 text-sm">
                  <p className="truncate font-medium text-gray-900" title={file.original_name}>
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(file.size_bytes)} · {formatDateTime(file.created_at)}
                  </p>
                </td>

                <td className="px-4 py-3 text-sm">
                  <WorkbookCell file={file} />
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                  {file.status === "identified" && file.fill_state ? FILL_LABEL[file.fill_state] : "—"}
                </td>

                <td className="max-w-xs px-4 py-3 text-sm text-gray-700">
                  {file.institution.declared ? (
                    <>
                      <p className="line-clamp-2" title={file.institution.declared}>
                        {file.institution.declared}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.institution.resolved ? `Registrada: ${file.institution.resolved}` : "Sin coincidencia registrada"}
                      </p>
                    </>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="px-4 py-3 text-sm">
                  <FileStatusBadge status={file.status} />
                  {file.status === "duplicate" && file.duplicate_of && (
                    <p className="mt-1 max-w-[14rem] truncate text-xs text-gray-500" title={file.duplicate_of.original_name}>
                      de «{file.duplicate_of.original_name}»
                    </p>
                  )}
                  {(file.status === "failed" || file.status === "unrecognized") && file.error && (
                    <p className="mt-1 max-w-[16rem] text-xs text-gray-600 line-clamp-2" title={file.error}>
                      {file.error}
                    </p>
                  )}
                  {file.warnings_count > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-800">
                      <TriangleAlert size={12} aria-hidden="true" />
                      {file.warnings_count === 1 ? "1 aviso" : `${file.warnings_count} avisos`}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/cuadernos/archivos/${file.id}`}
                    className="inline-flex rounded-lg border border-[#691b31] bg-white p-1.5 text-[#691b31] transition hover:bg-[#691b31] hover:text-white"
                    title="Ver detalle"
                    aria-label={`Ver detalle de ${file.original_name}`}
                  >
                    <Eye size={20} strokeWidth={1.75} />
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkbookCell({ file }: { file: WorkbookFile }) {
  const workbook = file.workbook;
  if (!workbook) return <span className="text-gray-400">—</span>;

  const numbers = workbook.sections.map((s) => s.number).filter((n): n is number => n !== null);
  const sections =
    numbers.length === 0 ? "módulo completo" : numbers.length === 1 ? `sección ${numbers[0]}` : `secciones ${compactNumbers(numbers)}`;

  return (
    <>
      <p className="font-medium text-gray-900">
        {workbook.program} {workbook.year} · Módulo {workbook.module_number}
        {workbook.kind === "anexo" && (
          <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-700">
            {KIND_LABEL.anexo}
          </span>
        )}
      </p>
      <p className="text-gray-600">
        {workbook.module_name ?? "Sin nombre de módulo"} · {sections}
      </p>
      <p className="font-mono text-xs text-gray-500">
        {workbook.code}
        {file.question_count !== null && ` · ${file.question_count} preguntas`}
      </p>
    </>
  );
}
