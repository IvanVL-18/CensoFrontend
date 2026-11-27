// Contrato de la API de recepción de cuadernos del INEGI
// (apis-censo: WorkbookFileController y WorkbookFileResource).
// Los ids de archivo son UUID estables: sí se pueden comparar entre respuestas.

import type { FileAnswersDetail, FileAnswersSummary } from "./Answers.types";

export type WorkbookFileStatus =
  | "queued"
  | "processing"
  | "identified"
  | "duplicate"
  | "unrecognized"
  | "failed";

/** Filtro de la lista: "pending" agrupa queued y processing. */
export type WorkbookFileFilter = "all" | "pending" | WorkbookFileStatus;

export type FillState = "blank" | "answered";

export type WorkbookKind = "principal" | "anexo";

export type TemplateStatus = "pending" | "compiled" | "in_review" | "approved";

export interface WorkbookSectionSummary {
  number: number | null;
  name: string | null;
  questions: number;
}

export interface WorkbookSummary {
  code: string;
  program: string;
  year: number;
  module_number: number;
  module_name: string | null;
  kind: WorkbookKind;
  sections: WorkbookSectionSummary[];
  question_count: number;
  template_status: TemplateStatus;
  parent_code: string | null;
}

export interface WorkbookFile {
  id: string;
  original_name: string;
  extension: string;
  size_bytes: number;
  sha256: string;
  status: WorkbookFileStatus;
  fill_state: FillState | null;
  error: string | null;
  can_retry: boolean;
  created_at: string | null;
  processed_at: string | null;
  uploaded_by: string | null;
  workbook: WorkbookSummary | null;
  duplicate_of: {
    id: string;
    original_name: string;
    created_at: string | null;
    status: WorkbookFileStatus;
  } | null;
  institution: {
    declared: string | null;
    resolved: string | null;
    /** Cómo se ligó: mismo nombre, alias confirmado antes o elegida a mano. */
    via: "exact" | "alias" | "manual" | null;
  };
  /** Respuestas del archivo: estado y conteos, nunca valores. */
  answers: FileAnswersSummary;
  question_count: number | null;
  informants_count: number;
  warnings_count: number;
}

export interface IdentifiedSection {
  number: number | null;
  name: string | null;
  title: string | null;
  sheets: string[];
  questions: number;
  anchors: string[];
}

export interface WorkbookFileDetail extends WorkbookFile {
  identification?: {
    census_title: string | null;
    module_title: string | null;
    entity: { name: string | null; code: string | null } | null;
    sections: IdentifiedSection[];
    extra_sheets: string[];
    warnings: string[];
  };
  answers_detail?: FileAnswersDetail;
}

export interface Informant {
  position: number;
  title: string | null;
  name: string | null;
  first_surname: string | null;
  second_surname: string | null;
  declared_institution: string | null;
  institution: string | null;
  job_title: string | null;
  phone: string | null;
  email: string | null;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
  per_page: number;
}

export interface WorkbookFilesPage {
  data: WorkbookFile[];
  links: PaginationLinks;
  meta: PaginationMeta;
  counts: Record<WorkbookFileStatus, number>;
  /** Hay archivos en cola o procesándose: la pantalla vuelve a consultar. */
  pending: boolean;
}

// ── Tablero de avance ──

export type ProgressStatus = "received" | "possibly_missing";
export type MissingReason = "gap" | "previous_edition";

export interface Edition {
  program: string;
  year: number;
  workbooks: number;
}

export interface ProgressSection {
  number: number | null;
  name: string | null;
  questions: number | null;
  status: ProgressStatus;
  missing_reason: MissingReason | null;
  /** Nombre de la sección con ese número en la edición anterior (referencia). */
  previous_name: string | null;
  workbook: string | null;
  annexes: string[];
}

export interface ProgressModule {
  number: number | null;
  name: string | null;
  status: ProgressStatus;
  missing_reason: MissingReason | null;
  previous: { year: number | null; number: number } | null;
  sections: ProgressSection[];
}

export interface ProgressWorkbook {
  code: string;
  kind: WorkbookKind;
  module_number: number;
  question_count: number;
  template_status: TemplateStatus;
  /** Preguntas de la plantilla que esperan revisión; null si todavía no se compila. */
  template_to_review: number | null;
  compile_error: string | null;
  blank_files: number;
  answered_files: number;
  /** Archivos cuyas respuestas están vigentes en el censo. */
  answers_imported: number;
  /** Archivos con respuestas leídas que esperan que alguien confirme. */
  answers_to_confirm: number;
  last_answered: {
    file_id: string;
    original_name: string;
    received_at: string | null;
    declared_institution: string | null;
    institution: string | null;
  } | null;
}

export interface EditionProgress {
  edition: { program: string; year: number };
  previous_edition: { program: string; year: number } | null;
  totals: {
    modules_received: number;
    modules_possibly_missing: number;
    sections_received: number;
    sections_answered: number;
    sections_possibly_missing: number;
    questions: number;
    files: number;
  };
  modules: ProgressModule[];
  workbooks: Record<string, ProgressWorkbook>;
}

export interface ProgressResponse {
  editions: Edition[];
  progress: EditionProgress | null;
}
