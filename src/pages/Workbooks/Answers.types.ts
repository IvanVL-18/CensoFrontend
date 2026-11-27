// Contrato de la API de respuestas de los cuadernos
// (apis-censo: WorkbookAnswerController y Services/Workbooks/Answers).
// Con workbooks.view llegan conteos y avisos; los valores piden workbook-answers.view.

import type { CompiledAnswer, CompiledTemplate, QuestionKind } from "../../lib/compiledTemplate";
import type { WorkbookFileDetail } from "./Workbooks.types";

/** Estado de las respuestas de un archivo; null si no hay respuestas que leer. */
export type AnswersStatus = "pending" | "extracted" | "same" | "imported" | "superseded" | "failed";

/** Cómo quedó la lectura de una pregunta. */
export type QuestionAnswerStatus = "ok" | "warning" | "error" | "empty";

/** Qué cambia una pregunta frente a las respuestas vigentes. */
export type AnswerChange = "new" | "changed" | "same" | "removed";

export interface ExtractionReport {
  questions: number;
  ok: number;
  warning: number;
  error: number;
  empty: number;
  /** Celdas de captura con algo escrito. */
  filled: number;
  /** Filas llenas de las tablas de lista. */
  list_rows: number;
  seconds: number;
}

export interface FileAnswersSummary {
  status: AnswersStatus | null;
  version: number | null;
  report: ExtractionReport | null;
  error: string | null;
  extracted_at: string | null;
  imported_at: string | null;
  /** El archivo que ya traía estas mismas respuestas. */
  same_as: { id: string; original_name: string; status: AnswersStatus | null } | null;
}

export interface FileAnswersDetail {
  /** Por qué de este archivo no se leen respuestas. */
  unsupported: string | null;
  /** Por qué todavía no se pueden importar. */
  blocker: string | null;
  imported_by: string | null;
}

export interface AnswerQuestionRow {
  /** Id de la pregunta compilada: estable, se puede comparar. */
  id: number;
  anchor: string;
  section_number: number | null;
  kind: QuestionKind;
  text: string;
  status: QuestionAnswerStatus;
  filled: number;
  list_rows: number;
  /** Nunca citan lo que alguien escribió. */
  warnings: string[];
  change: AnswerChange | null;
}

export interface VersionFile {
  id: string;
  original_name: string;
  version: number | null;
  imported_at: string | null;
}

export interface FileAnswersPreview {
  file: WorkbookFileDetail;
  /** Archivo con las respuestas vigentes, si es otro. */
  against: VersionFile | null;
  changes: Record<AnswerChange, number> | null;
  questions: AnswerQuestionRow[];
}

export interface AnswerQuestionDetail {
  question: {
    id: number;
    anchor: string;
    section_number: number | null;
    sheet: string;
    kind: QuestionKind;
    text: string;
    template: CompiledTemplate;
  };
  workbook: { code: string; year: number; module_name: string | null };
  status: QuestionAnswerStatus;
  warnings: string[];
  filled: number;
  list_rows: number;
  answer: CompiledAnswer | null;
  change: AnswerChange | null;
  previous: { file: VersionFile; answer: CompiledAnswer | null } | null;
}

export interface ImportReport {
  version: number;
  created: number;
  updated: number;
  unchanged: number;
  removed: number;
  skipped: number;
}

export interface InstitutionOption {
  /** Id cifrado: cambia en cada respuesta, no se compara; solo se manda de vuelta. */
  id: string;
  name: string;
  shared_words?: number;
}

export interface InstitutionOptions {
  declared: string | null;
  current: string | null;
  suggestions: InstitutionOption[];
  results: InstitutionOption[];
}
