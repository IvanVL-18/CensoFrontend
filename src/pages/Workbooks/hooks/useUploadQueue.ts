import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  uploadErrorMessage,
  uploadWorkbookFile,
} from "../Workbooks.service";
import type { WorkbookFile } from "../Workbooks.types";

/** Subidas simultáneas: suficientes para no esperar y sin saturar al servidor. */
const CONCURRENCY = 2;

export type UploadState = "waiting" | "uploading" | "done" | "error";

export interface UploadItem {
  key: string;
  name: string;
  size: number;
  state: UploadState;
  progress: number;
  error?: string;
  result?: WorkbookFile;
}

/** Revisa en el navegador lo que el backend rechazaría, para no subirlo. */
function problemWith(file: File): string | null {
  if (file.name.startsWith("~$")) {
    return "Es un archivo temporal de Excel (empieza con «~$»), no un cuaderno.";
  }
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Solo se aceptan cuadernos .xlsx o .xlsm.";
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Pesa más de ${MAX_FILE_SIZE_MB} MB.`;
  }
  if (file.size === 0) {
    return "El archivo está vacío.";
  }
  return null;
}

/**
 * Cola de subida: un archivo por petición, dos a la vez, con el avance de cada
 * uno. Si se sale de la pantalla, las subidas en curso terminan igual.
 *
 * `onSettled` se llama al terminar cada subida, salga bien o mal: aunque la
 * respuesta falle, el archivo pudo haber llegado al servidor, y la lista debe
 * mostrar lo que de verdad hay.
 */
export function useUploadQueue(onSettled: () => void) {
  const [items, setItems] = useState<UploadItem[]>([]);

  const waiting = useRef<{ key: string; file: File }[]>([]);
  const active = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const onSettledRef = useRef(onSettled);
  const pumpRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  const patch = useCallback((key: string, changes: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }, []);

  const pump = useCallback(() => {
    while (active.current < CONCURRENCY && waiting.current.length > 0) {
      const next = waiting.current.shift();
      if (!next) break;

      active.current += 1;
      const controller = new AbortController();
      controllers.current.set(next.key, controller);
      patch(next.key, { state: "uploading", progress: 0 });

      uploadWorkbookFile(next.file, (progress) => patch(next.key, { progress }), controller.signal)
        .then((result) => {
          patch(next.key, { state: "done", progress: 100, result });
        })
        .catch((error) => {
          patch(next.key, { state: "error", error: uploadErrorMessage(error) });
        })
        .finally(() => {
          active.current -= 1;
          controllers.current.delete(next.key);
          onSettledRef.current();
          pumpRef.current();
        });
    }
  }, [patch]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const add = useCallback(
    (files: File[]) => {
      const fresh: UploadItem[] = [];
      for (const file of files) {
        const problem = problemWith(file);
        const key = uuidv4();
        fresh.push({
          key,
          name: file.name,
          size: file.size,
          state: problem ? "error" : "waiting",
          progress: 0,
          error: problem ?? undefined,
        });
        if (!problem) waiting.current.push({ key, file });
      }

      setItems((prev) => [...fresh, ...prev]);
      pump();
    },
    [pump],
  );

  /** Quita de la cola un archivo que no ha empezado, o cancela el que se está subiendo. */
  const cancel = useCallback((key: string) => {
    const before = waiting.current.length;
    waiting.current = waiting.current.filter((item) => item.key !== key);
    if (waiting.current.length < before) {
      setItems((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    controllers.current.get(key)?.abort();
  }, []);

  const clearFinished = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.state === "waiting" || item.state === "uploading"));
  }, []);

  const busy = items.some((item) => item.state === "waiting" || item.state === "uploading");

  // Aviso del navegador si se cierra la pestaña con subidas pendientes.
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  return { items, add, cancel, clearFinished, busy };
}
