// Etiquetas de la revisión de plantillas compiladas (docs/CARGA_CENSOS.md, §7.4).

import type { MatchStatus, ReviewStatus, TemplateFlag } from "./Templates.types";

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
};
