import { Link } from "react-router-dom";
import { CircleAlert, CircleCheck, Clock, LoaderCircle, X } from "lucide-react";
import type { UploadItem } from "../hooks/useUploadQueue";
import type { WorkbookFile, WorkbookFileStatus } from "../Workbooks.types";
import { STATUS_LABEL, formatBytes } from "../workbookLabels";

interface UploadQueueProps {
  items: UploadItem[];
  /** Estado actual de los archivos de la lista, por id. La lista se actualiza sola mientras hay archivos en cola. */
  currentStatus: Record<string, WorkbookFileStatus>;
  onCancel: (key: string) => void;
  onClearFinished: () => void;
}

/** Archivos que se están subiendo en esta sesión, con su avance. */
export function UploadQueue({ items, currentStatus, onCancel, onClearFinished }: UploadQueueProps) {
  if (items.length === 0) return null;

  const finished = items.filter((item) => item.state === "done" || item.state === "error").length;

  return (
    <section className="rounded-xl border border-gray-200" aria-label="Subidas en curso">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-800">
          Subidas de esta sesión
          <span className="ml-2 font-normal text-gray-500">
            {finished} de {items.length} terminadas
          </span>
        </h2>
        {finished > 0 && (
          <button
            type="button"
            className="text-sm text-[var(--pantone-7421)] hover:underline"
            onClick={onClearFinished}
          >
            Limpiar terminadas
          </button>
        )}
      </div>

      <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3 px-4 py-2 text-sm">
            <StateIcon state={item.state} />

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-800" title={item.name}>
                {item.name}
              </p>
              {item.state === "uploading" && (
                <div
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                  role="progressbar"
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Subiendo ${item.name}`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--pantone-7421)] transition-[width]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              {item.state === "error" && <p className="text-red-700">{item.error}</p>}
              {item.state === "done" && item.result && (
                <p className="text-gray-600">
                  {receivedText(item.result, currentStatus[item.result.id])}
                  {" · "}
                  <Link
                    to={`/admin/cuadernos/archivos/${item.result.id}`}
                    className="text-[var(--pantone-7421)] hover:underline"
                  >
                    Ver detalle
                  </Link>
                </p>
              )}
            </div>

            <span className="shrink-0 tabular-nums text-gray-500">
              {item.state === "uploading" ? `${item.progress} %` : formatBytes(item.size)}
            </span>

            {(item.state === "waiting" || item.state === "uploading") && (
              <button
                type="button"
                onClick={() => onCancel(item.key)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                title={item.state === "waiting" ? "Quitar de la cola" : "Cancelar la subida"}
                aria-label={`Cancelar ${item.name}`}
              >
                <X size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Lo que se sabe del archivo ahora. Si está en la lista, su estado actual. Si no, el
 * que tenía al subirse, salvo «En cola» o «Procesando», que ya pueden haber cambiado.
 */
function receivedText(result: WorkbookFile, current?: WorkbookFileStatus): string {
  const pending = result.status === "queued" || result.status === "processing";
  const status = current ?? (pending ? null : result.status);

  let text = "Recibido";
  if (status) text += ` · ${STATUS_LABEL[status]}`;
  if (status === "duplicate" && result.duplicate_of) {
    text += ` de «${result.duplicate_of.original_name}»`;
  }
  return text;
}

function StateIcon({ state }: { state: UploadItem["state"] }) {
  const common = { size: 18, "aria-hidden": true } as const;
  switch (state) {
    case "waiting":
      return <Clock {...common} className="shrink-0 text-gray-400" />;
    case "uploading":
      return <LoaderCircle {...common} className="shrink-0 animate-spin text-[var(--pantone-7421)]" />;
    case "done":
      return <CircleCheck {...common} className="shrink-0 text-green-700" />;
    default:
      return <CircleAlert {...common} className="shrink-0 text-red-700" />;
  }
}
