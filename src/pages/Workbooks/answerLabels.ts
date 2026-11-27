// Etiquetas de las respuestas de los cuadernos (docs/CARGA_CENSOS.md, §7.5).

import type { AnswerChange, AnswersStatus, ExtractionReport, QuestionAnswerStatus } from "./Answers.types";

export const ANSWERS_LABEL: Record<AnswersStatus, string> = {
  pending: "Leyendo respuestas",
  extracted: "Por confirmar",
  same: "Sin cambios",
  imported: "Importadas",
  superseded: "Versión anterior",
  failed: "No se pudieron leer",
};

export const ANSWERS_HELP: Record<AnswersStatus, string> = {
  pending: "Las respuestas del archivo se están leyendo.",
  extracted: "Las respuestas ya se leyeron; falta que una persona confirme para que entren al censo.",
  same: "Trae las mismas respuestas que otro archivo ya recibido: no hay nada que importar.",
  imported: "Son las respuestas vigentes en el censo.",
  superseded: "Estuvieron en el censo; las sustituyó una versión más nueva.",
  failed: "No se pudieron leer las respuestas del archivo.",
};

export const QUESTION_STATUS_LABEL: Record<QuestionAnswerStatus, string> = {
  ok: "Bien",
  warning: "Con avisos",
  error: "No se leyó",
  empty: "En blanco",
};

export const CHANGE_LABEL: Record<AnswerChange, string> = {
  new: "Nueva",
  changed: "Cambió",
  same: "Igual",
  removed: "Quedó en blanco",
};

export const VIA_LABEL: Record<"exact" | "alias" | "manual", string> = {
  exact: "mismo nombre que en el catálogo",
  alias: "por un nombre ya confirmado",
  manual: "elegida a mano",
};

const count = (n: number, one: string, many: string) => `${n.toLocaleString("es-MX")} ${n === 1 ? one : many}`;

/** «281 contestadas · 13 con avisos · 29 en blanco», sin lo que vale cero. */
export const reportSummary = (report: ExtractionReport): string =>
  [
    count(report.ok + report.warning, "pregunta contestada", "preguntas contestadas"),
    report.warning > 0 ? count(report.warning, "con avisos", "con avisos") : null,
    report.error > 0 ? count(report.error, "no se leyó", "no se leyeron") : null,
    report.empty > 0 ? count(report.empty, "en blanco", "en blanco") : null,
  ]
    .filter(Boolean)
    .join(" · ");

/** «3 celdas · 1 fila» de una pregunta. */
export const captureSummary = (filled: number, listRows: number): string =>
  [count(filled, "celda", "celdas"), listRows > 0 ? count(listRows, "fila", "filas") : null].filter(Boolean).join(" · ");
