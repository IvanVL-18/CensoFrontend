// Contrato de la API de revisión de plantillas compiladas
// (apis-censo: WorkbookTemplateController y Services/Workbooks/Templates/TemplateReview).
// Los ids de las preguntas compiladas son números estables: sí se pueden comparar.

import type { CompiledTemplate, QuestionKind } from "../../lib/compiledTemplate";
import type { TemplateStatus, WorkbookKind, WorkbookSectionSummary } from "./Workbooks.types";

export type MatchStatus = "same" | "retouched" | "new";
export type ReviewStatus = "pending" | "approved" | "not_needed";

/** Motivos por los que el compilador manda una pregunta a revisión. */
export type TemplateFlag =
  | "no_capture"
  | "row_layouts"
  | "no_label"
  | "no_option_labels"
  | "text_too_long"
  | "invalid_template"
  | "uneven_blocks"
  | "needs_blank";

/**
 * Cómo marca el cuaderno sus celdas de captura. «protected»: con la protección de la hoja;
 * «mixed»: solo en parte de sus preguntas; «border»: sin protección, por el borde de la celda;
 * «open»: no se reconocieron celdas de captura.
 */
export type WorkbookDesign = "protected" | "mixed" | "border" | "open";

export interface TemplateReport {
  questions: number;
  kinds: Partial<Record<QuestionKind, number>>;
  matches: Partial<Record<MatchStatus, number>>;
  flags: Partial<Record<TemplateFlag, number>>;
  to_review: number;
  seconds: number;
  /**
   * Si la plantilla se armó con el cuaderno en blanco. false: se armó con un contestado y, en
   * los diseños sin protección, solo se leen las preguntas que coinciden con las de otra edición.
   * null si no se sabe o no hizo falta saberlo.
   */
  blank?: boolean | null;
}

export interface TemplateWorkbook {
  code: string;
  program: string;
  year: number;
  module_number: number;
  module_name: string | null;
  kind: WorkbookKind;
  sections: WorkbookSectionSummary[];
  template_status: TemplateStatus;
  design: WorkbookDesign | null;
  compiled_at: string | null;
  compile_error: string | null;
  report: TemplateReport | null;
  /** Nombre del censo al que quedó ligado. */
  census: string | null;
}

/** Dónde está en otra edición la pregunta con la que se casó. */
export interface MatchedPlacement {
  anchor: string;
  year: number;
  workbook: string;
}

export interface TemplateQuestionRow {
  id: number;
  sheet: string;
  section_number: number | null;
  /** Número de la pregunta en el cuaderno: «9.2». */
  anchor: string;
  position: number;
  kind: QuestionKind;
  /** Texto tal como viene en el Excel de esta edición. */
  text: string;
  /** Cuántos campos tiene. */
  fields: number;
  flags: TemplateFlag[];
  match_status: MatchStatus | null;
  similarity: number | null;
  review_status: ReviewStatus;
  matched: MatchedPlacement | null;
}

export interface MissingQuestion {
  anchor: string;
  text: string;
  kind: QuestionKind;
  year: number;
  workbook: string;
}

export interface WorkbookTemplateSummary {
  workbook: TemplateWorkbook;
  questions: TemplateQuestionRow[];
  /** Preguntas de la edición anterior que ya no aparecen en esta. */
  missing: MissingQuestion[];
  /** Solo en la respuesta de «aprobar»: cuántas se aprobaron. */
  approved?: number;
}

export interface CellPosition {
  col: string;
  /** Filas de distancia desde la fila del ancla (o desde el inicio del bloque, en un bloque repetido). */
  row: number;
  /** Las demás casillas de un campo que ocupa varias (una fecha escrita como mes y año). */
  more?: { col: string; row: number }[];
}

export interface ListCellMap {
  first_row: number;
  /** Filas físicas de la tabla: si viene partida en dos mitades, las de una. */
  rows: number;
  /** null si la tabla no numera sus renglones. */
  number_col: string | null;
  /** Columna de cada campo, por clave. */
  columns: Record<string, string>;
  /** En una tabla partida en dos: las columnas de las demás mitades, con las mismas claves. */
  extra?: Record<string, string>[];
  /** Columnas de las demás casillas de un campo que ocupa varias. */
  parts?: Record<string, string[]>;
}

/** Dónde están los bloques repetidos de la pregunta. Las posiciones de sus campos y tablas son relativas al inicio del bloque. */
export interface RepeatCellMap {
  /** Filas de distancia desde el ancla hasta el inicio del primer bloque. */
  first_row: number;
  /** Filas entre el inicio de un bloque y el del siguiente. */
  stride: number;
  count: number;
  fields: Record<string, CellPosition>;
  lists: ListCellMap[];
}

export interface TemplateCellMap {
  sheet: string;
  anchor_row: number;
  fields: Record<string, CellPosition>;
  lists: ListCellMap[];
  comment: CellPosition | null;
  repeat?: RepeatCellMap;
}

export interface TemplateQuestionDetail extends Omit<TemplateQuestionRow, "fields"> {
  fields: number;
  workbook: { code: string; program: string; year: number; module_name: string | null };
  template: CompiledTemplate;
  cell_map: TemplateCellMap;
  previous:
    | (MatchedPlacement & {
        question_id: number;
        text: string;
        kind: QuestionKind;
        template: CompiledTemplate | null;
      })
    | null;
  placement: { index: string | null; section: string | null } | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}
