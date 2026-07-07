// Contratos del API de importación masiva de respuestas desde Excel INEGI.
// Espejo de AnswerImportController (POST /imports/answers/preview|confirm).

export interface ImportEntity {
  nombre: string;
  clave: string | null;
}

export interface ImportInformant {
  titulo: string | null;
  nombre_completo: string;
  institucion: string | null;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
}

export interface SuggestedUser {
  id_encrypted: string;
  name: string;
  email: string;
  institution: string | null;
  match_reason: "correo" | "institucion";
}

export type QuestionEstado = "ok" | "advertencia" | "error";

export interface QuestionPreviewRow {
  census_question_id_encrypted: string;
  codigo: string;
  estado: QuestionEstado;
  filas: number;
  warnings: string[];
  error: string | null;
  comment: string | null;
}

export interface ImportTotals {
  ok: number;
  con_advertencias: number;
  errores: number;
}

export interface ImportPreviewResponse {
  batch_id: string;
  template_code: string;
  entidad: ImportEntity | null;
  informant: ImportInformant;
  suggested_user: SuggestedUser | null;
  questions: QuestionPreviewRow[];
  totals: ImportTotals;
}

export interface ImportConfirmResponse {
  message: string;
  created: number;
  updated: number;
  comments_saved: number;
  skipped: string[];
  warnings: string[];
}

export interface ImportUserOption {
  id: string; // cifrado
  name: string;
  email: string;
  institution: string | null;
}

export interface CensusOption {
  id: string; // cifrado
  name: string;
}
