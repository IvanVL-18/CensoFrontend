// Contrato de la API de consulta de respuestas importadas, para la vista digital
// (apis-censo: CensusAnswerController y Services/Workbooks/Answers/CensusAnswerBrowser).
// Con workbooks.view llega quién contestó qué; los valores piden workbook-answers.view.

import type { CompiledAnswer, CompiledTemplate, QuestionKind } from "../../lib/compiledTemplate";
import type { QuestionAnswerStatus, VersionFile } from "./Answers.types";

/** Un censo armado desde cuadernos del INEGI. */
export interface AnswersEdition {
  program: string;
  year: number;
  name: string;
  questions: number;
  /** Respuestas importadas, sumando todas las instituciones. */
  answered: number;
  institutions: number;
}

export interface SectionInstitution {
  /** Id cifrado: cambia en cada respuesta; solo se manda de vuelta. La institución se sigue por nombre. */
  id: string;
  name: string;
  answered: number;
  updated_at?: string | null;
}

export interface OverviewSection {
  /** Índice de la sección en el censo: «1.3». Sirve de dirección. */
  index: string;
  name: string | null;
  questions: number;
  workbook: string | null;
  institutions: SectionInstitution[];
}

export interface OverviewModule {
  number: string | null;
  name: string | null;
  sections: OverviewSection[];
}

export interface CensusRef {
  program: string;
  year: number;
  name: string;
}

export interface AnswersOverview {
  census: CensusRef;
  totals: {
    questions: number;
    answered: number;
    institutions: number;
    sections: number;
    sections_answered: number;
  };
  modules: OverviewModule[];
}

export interface SectionQuestion {
  /** Id de la pregunta compilada: estable. */
  id: number;
  anchor: string;
  kind: QuestionKind;
  text: string;
  answered: boolean;
  /** Cómo quedó su lectura en el archivo del que salió; null si no se contestó. */
  status: QuestionAnswerStatus | null;
  warnings: string[];
  /** Preguntas de las que se llenan solas las filas de sus tablas. */
  rows_from: string[];
}

export interface SectionAnswers {
  census: CensusRef;
  module: { number: string | null; name: string | null };
  section: { index: string; name: string | null; previous: string | null; next: string | null };
  institutions: SectionInstitution[];
  /** Nombre de la institución cuyas respuestas se muestran. */
  institution: string | null;
  files: VersionFile[];
  questions: SectionQuestion[];
}

/** Nombre de cada fila de una tabla, tomado de la pregunta de la que se llena. */
export interface RowSource {
  list: number;
  anchor: string;
  label: string[];
  rows: Record<string, string>;
}

export interface PreviousEdition {
  year: number;
  anchor: string;
  workbook: string;
  text: string;
  template: CompiledTemplate;
  institution: string | null;
  /** false: esa edición la contestó otra institución. */
  same_institution: boolean;
  answer: CompiledAnswer | null;
}

export interface QuestionAnswers {
  question: {
    id: number;
    anchor: string;
    section_number: number | null;
    sheet: string;
    kind: QuestionKind;
    text: string;
    template: CompiledTemplate;
  };
  workbook: { code: string; program: string; year: number; module_name: string | null };
  institution: string | null;
  answer: CompiledAnswer | null;
  status: QuestionAnswerStatus | null;
  warnings: string[];
  file: VersionFile | null;
  row_sources: RowSource[];
  previous: PreviousEdition | null;
}

/** Todas las respuestas de una sección: cada pregunta, igual que al pedirla sola. */
export interface SectionBundle {
  census: CensusRef;
  module: { number: string | null; name: string | null };
  section: { index: string; name: string | null };
  institution: string | null;
  questions: QuestionAnswers[];
}
