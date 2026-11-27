import type {
  FillState,
  MissingReason,
  TemplateStatus,
  WorkbookFileStatus,
  WorkbookKind,
} from "./Workbooks.types";

export const STATUS_LABEL: Record<WorkbookFileStatus, string> = {
  queued: "En cola",
  processing: "Identificando",
  identified: "Identificado",
  duplicate: "Duplicado",
  unrecognized: "No reconocido",
  failed: "Con error",
};

export const STATUS_HELP: Record<WorkbookFileStatus, string> = {
  queued: "Recibido; espera su turno para leerse.",
  processing: "Se está leyendo el contenido del archivo.",
  identified: "Se reconoció el cuaderno por su contenido.",
  duplicate: "Es una copia exacta de un archivo ya recibido; no se procesó otra vez.",
  unrecognized: "No parece un cuaderno del INEGI.",
  failed: "No se pudo leer el archivo.",
};

export const FILL_LABEL: Record<FillState, string> = {
  blank: "En blanco",
  answered: "Contestado",
};

export const KIND_LABEL: Record<WorkbookKind, string> = {
  principal: "Cuaderno principal",
  anexo: "Anexo",
};

export const TEMPLATE_LABEL: Record<TemplateStatus, string> = {
  pending: "Sin compilar",
  compiled: "Compilada",
  in_review: "En revisión",
  approved: "Aprobada",
};

export const MISSING_REASON_LABEL: Record<MissingReason, string> = {
  gap: "hueco en la numeración",
  previous_edition: "estaba en la edición anterior",
};

export const INFORMANT_POSITION_LABEL = (position: number): string =>
  position === 1 ? "Básica" : `Complementaria ${position - 1}`;

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const dateTimeFormat = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (iso: string | null | undefined): string =>
  iso ? dateTimeFormat.format(new Date(iso)) : "—";

/** "Sección 3", o "Módulo completo" cuando el cuaderno no divide en secciones. */
export const sectionLabel = (number: number | null): string =>
  number === null ? "Módulo completo" : `Sección ${number}`;

/** "1, 2, 3, 5" → "1 a 3, 5" para listas de secciones. */
export const compactNumbers = (numbers: number[]): string => {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start: number | null = null;
  let prev: number | null = null;
  const flush = () => {
    if (start === null || prev === null) return;
    parts.push(start === prev ? `${start}` : prev === start + 1 ? `${start}, ${prev}` : `${start} a ${prev}`);
  };
  for (const n of sorted) {
    if (start !== null && prev !== null && n === prev + 1) {
      prev = n;
      continue;
    }
    flush();
    start = prev = n;
  }
  flush();
  return parts.join(", ");
};
