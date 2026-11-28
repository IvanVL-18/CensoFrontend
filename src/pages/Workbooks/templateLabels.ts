// Etiquetas de la revisión de plantillas compiladas (docs/CARGA_CENSOS.md, §7.4).

import type { MatchStatus, ReviewStatus, TemplateFlag, WorkbookDesign } from "./Templates.types";

export const MATCH_LABEL: Record<MatchStatus, string> = {
  same: "Igual",
  retouched: "Con retoques",
  new: "Nueva",
};

export const MATCH_HELP: Record<MatchStatus, string> = {
  same: "Es la misma pregunta que en otra edición: se reutiliza y no hace falta revisarla.",
  retouched: "Se parece a una pregunta de otra edición, pero cambió el texto o la tabla.",
  new: "No se parece a ninguna pregunta ya cargada.",
};

export const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: "Por revisar",
  approved: "Aprobada",
  not_needed: "No hace falta",
};

export const FLAG_LABEL: Record<TemplateFlag, string> = {
  no_capture: "No se encontraron celdas de captura",
  row_layouts: "La tabla tiene filas de más de una forma",
  no_label: "Hay campos sin encabezado",
  no_option_labels: "Hay opciones sin etiqueta",
  text_too_long: "El texto no cabe en la base de datos",
  invalid_template: "La plantilla salió mal formada: avisa a quien mantiene el sistema",
  uneven_blocks: "Los bloques repetidos no tienen todos la misma forma",
  needs_blank: "Hace falta el cuaderno en blanco: la plantilla no se puede armar con un contestado",
};

/** Cómo marca el cuaderno sus celdas de captura, en corto. */
export const DESIGN_LABEL: Record<WorkbookDesign, string> = {
  protected: "Protegido",
  mixed: "Mixto",
  border: "Sin protección",
  open: "Sin celdas de captura",
};

/** Lo que hay que saber de un cuaderno que no usa el diseño protegido. */
export const DESIGN_HELP: Partial<Record<WorkbookDesign, string>> = {
  mixed:
    "Este cuaderno no usa el diseño protegido en todas sus preguntas. Las que no lo usan quedan sin celdas de captura hasta que se agregue su perfil de lectura.",
  border: "Sin protección: la celda de captura se reconoce por su borde.",
  open: "No se reconocieron celdas de captura en este cuaderno.",
};

/** Aviso de una plantilla armada con un contestado (`report.blank === false`). */
export const ANSWERED_SOURCE_NOTICE =
  "Esta plantilla se armó con un contestado. En este diseño solo se leen las preguntas que coinciden con las de otra edición; para leer todas, sube el cuaderno en blanco de esta edición.";
