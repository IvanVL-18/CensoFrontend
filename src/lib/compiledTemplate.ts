// Plantillas compiladas de los cuadernos del INEGI (docs/CARGA_CENSOS.md, §7.3).
// Toda la lógica de la plantilla vive aquí, igual que el motor de Form.io vive en
// formioOperations.ts. Contrato: apis-censo, Services/Workbooks/Compiler/QuestionCompiler.

export type QuestionKind = "simple" | "list" | "fixed" | "none";
export type FieldType = "code" | "mark" | "number" | "string" | "text";

export interface TemplateOption {
  value: string;
  label: string;
}

export interface TemplateField {
  key: string;
  /** Ruta de encabezados, de arriba hacia abajo. */
  label: string[];
  /** Etiqueta del renglón, en las tablas fijas y las listas de marcas. */
  row_label?: string;
  type: FieldType;
  options?: TemplateOption[];
  /** Índice de la tabla de lista a la que pertenece la columna. */
  list?: number;
}

/** h encabezado, l etiqueta, k número de renglón, e vacía, i captura, d heredada de otra pregunta. */
export interface GridCell {
  k: "h" | "l" | "k" | "e" | "i" | "d";
  t?: string;
  cs?: number;
  rs?: number;
  /** Clave del campo, en las celdas de captura. */
  f?: string;
  /** Texto girado. */
  v?: boolean;
  src?: string;
}

export interface GridRow {
  cells: GridCell[];
  /** Filas numeradas que siguen con la misma forma y no se dibujan. */
  fold?: number;
}

export interface TemplateGrid {
  /** Ancho de cada columna, en porcentaje. */
  cols: number[];
  rows: GridRow[];
}

export interface CompiledTemplate {
  version: number;
  kind: QuestionKind;
  /** Texto con marcadores de año: {year}, {year+1}, {year-1}. */
  text: string;
  instructions: string[];
  fields: TemplateField[];
  lists: { rows: number; fields: string[] }[];
  comment: boolean;
  grid: TemplateGrid;
}

export const KIND_LABEL: Record<QuestionKind, string> = {
  simple: "Simple",
  list: "Tabla de lista",
  fixed: "Tabla fija",
  none: "Sin celdas de captura",
};

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  code: "Opción de catálogo",
  mark: "Marca (X)",
  number: "Número",
  string: "Texto corto",
  text: "Texto largo",
};

/**
 * Sustituye los marcadores por los años de una edición. El año de referencia de
 * un censo es el anterior a su edición: en el CNGE 2026, {year} es 2025.
 */
export function withYears(text: string, editionYear: number): string {
  const reference = editionYear - 1;
  return text.replace(/\{year([+-]\d+)?\}/g, (_match, offset?: string) =>
    String(reference + (offset ? Number(offset) : 0)),
  );
}

/** «Encabezado › Subencabezado · Renglón»; vacío si el campo es la pregunta misma. */
export function fieldLabel(field: TemplateField, editionYear?: number): string {
  const path = field.label.join(" › ");
  const label = field.row_label ? (path ? `${path} · ${field.row_label}` : field.row_label) : path;
  return editionYear ? withYears(label, editionYear) : label;
}

export type DiffPart = { type: "same" | "added" | "removed"; text: string };

/** Diferencia palabra por palabra entre dos textos (subsecuencia común más larga). */
export function diffWords(before: string, after: string): DiffPart[] {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);

  // lengths[i][j]: palabras en común entre a[i..] y b[j..].
  const lengths: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] = a[i] === b[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const parts: DiffPart[] = [];
  const push = (type: DiffPart["type"], word: string) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += ` ${word}`;
    else parts.push({ type, text: word });
  };

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      push("removed", a[i++]);
    } else {
      push("added", b[j++]);
    }
  }
  while (i < a.length) push("removed", a[i++]);
  while (j < b.length) push("added", b[j++]);

  return parts;
}

export interface FieldsDiff {
  added: TemplateField[];
  removed: TemplateField[];
  /** Misma clave, pero cambió el tipo o las opciones. */
  changed: { before: TemplateField; after: TemplateField }[];
}

/** Qué cambió entre los campos de la pregunta anterior y los de la actual, casando por clave. */
export function diffFields(before: TemplateField[], after: TemplateField[]): FieldsDiff {
  const previous = new Map(before.map((field) => [field.key, field]));
  const current = new Map(after.map((field) => [field.key, field]));
  const options = (field: TemplateField) => (field.options ?? []).map((o) => `${o.value}=${o.label}`).join("|");

  return {
    added: after.filter((field) => !previous.has(field.key)),
    removed: before.filter((field) => !current.has(field.key)),
    changed: after.flatMap((field) => {
      const old = previous.get(field.key);
      return old && (old.type !== field.type || options(old) !== options(field)) ? [{ before: old, after: field }] : [];
    }),
  };
}

/** Texto corto de lo que se captura en un campo, para dibujarlo en la rejilla. */
export function fieldHint(field: TemplateField | undefined): string {
  if (!field) return "";
  switch (field.type) {
    case "mark":
      return "X";
    case "number":
      return "123";
    case "code": {
      const values = (field.options ?? []).map((option) => option.value);
      return values.length > 0 && values.length <= 4 ? values.join(" · ") : `catálogo${values.length ? ` (${values.length})` : ""}`;
    }
    default:
      return "texto";
  }
}
