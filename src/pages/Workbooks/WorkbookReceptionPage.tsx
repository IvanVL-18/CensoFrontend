import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Info, TriangleAlert } from "lucide-react";
import FileDropzone from "../../components/FileDropzone";
import Pagination from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import { useAuthContext } from "../../context/AuthContext";
import { WorkbooksHeader } from "./components/WorkbooksHeader";
import { UploadQueue } from "./components/UploadQueue";
import { StatusSummary } from "./components/StatusSummary";
import { WorkbookFilesTable } from "./components/WorkbookFilesTable";
import { useUploadQueue } from "./hooks/useUploadQueue";
import { useWorkbookFiles } from "./hooks/useWorkbookFiles";
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB } from "./Workbooks.service";

/**
 * Recepción de cuadernos del INEGI (docs/CARGA_CENSOS.md, Fase 1): se suben los
 * Excel tal como llegan, en cualquier orden, y cada uno se identifica por su
 * contenido en segundo plano.
 */
export default function WorkbookReceptionPage() {
  const { hasPermission } = useAuthContext();
  const canImport = hasPermission("workbooks.import");

  // El tablero enlaza aquí con ?buscar=<código del cuaderno>.
  const [searchParams] = useSearchParams();
  const list = useWorkbookFiles(searchParams.get("buscar") ?? "");
  const { refresh } = list;
  const onUploaded = useCallback(() => refresh(), [refresh]);
  const queue = useUploadQueue(onUploaded);

  const emptyMessage =
    list.filter === "all" && !list.searchTerm
      ? "Todavía no se ha recibido ningún cuaderno."
      : "Ningún archivo coincide con el filtro.";

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <WorkbooksHeader subtitle="Sube los Excel tal como llegan, por partes y en cualquier orden. Cada archivo se reconoce por su contenido, no por su nombre." />

      <div className="space-y-5 p-4 md:p-6">
        {canImport && (
          <FileDropzone
            accept={ACCEPTED_EXTENSIONS}
            multiple
            onFiles={queue.add}
            title={
              <>
                Arrastra aquí los cuadernos <strong>.xlsx</strong> o <strong>.xlsm</strong>
              </>
            }
            hint={`Puedes soltar varios a la vez, hasta ${MAX_FILE_SIZE_MB} MB cada uno. Una copia exacta de un archivo ya recibido se marca como duplicado y no se procesa otra vez.`}
          />
        )}

        <UploadQueue items={queue.items} onCancel={queue.cancel} onClearFinished={queue.clearFinished} />

        {list.stalled && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              Hay archivos en cola desde hace más de un minuto y medio. Si no avanzan, avisa al equipo de sistemas:
              el proceso que lee los cuadernos puede estar detenido.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <StatusSummary counts={list.counts} filter={list.filter} onFilter={list.changeFilter} />
          <div className="w-full lg:w-80">
            <SearchInput
              value={list.searchTerm}
              placeholder="Archivo, cuaderno o institución"
              onChange={list.setSearchTerm}
            />
          </div>
        </div>

        {list.pending && (
          <p className="flex items-center gap-1.5 text-sm text-gray-600" role="status">
            <Info size={16} aria-hidden="true" />
            Hay archivos identificándose; la lista se actualiza sola.
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <WorkbookFilesTable
            files={list.files}
            loading={list.loading}
            error={list.error}
            emptyMessage={emptyMessage}
          />
          <div className="border-t border-gray-200 bg-gray-50">
            <Pagination meta={list.meta} links={list.links} onPageNumber={list.setPage} loading={list.loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
