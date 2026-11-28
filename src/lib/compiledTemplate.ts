// Plantillas compiladas de los cuadernos del INEGI (docs/CARGA_CENSOS.md, §7.3).
// Toda la lógica de la plantilla vive aquí, igual que el motor de Form.io vive en
// formioOperations.ts. Contrato: apis-censo, resources/schemas/workbook-template.v1.schema.json
// (lo produce Services/Workbooks/Compiler/QuestionCompiler y lo valida TemplateSchema).
// Cómo se lee una respuesta en la vista digital (desgloses, sumas, tablas de lista) está en
// compiledAnswers.ts.

/** «blocks»: la pregunta trae bloques repetidos con la misma forma (ver `repeat`). */
export type QuestionKind = "simple" | "list" | "fixed" | "blocks" | "none";
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
  /**
   * En una casilla de «marque con X»: la opción que representa. En una columna de lista es la
   * del catálogo bajo su número; en una casilla suelta, la opción impresa a su lado («1. Sí»).
   * La etiqueta va vacía si el compilador no encontró el catálogo.
   */
  choice?: TemplateOption;
}

/** h encabezado, l etiqueta, k número de renglón, e vacía, i captura, d heredada de otra pregunta. */
export interface GridCell {
  k: "h" | "l" | "k" | "e" | "i" | "d";
  t?: string;
  cs?: number;
  rs?: number;
  /** Clave del campo, en las celdas de captura. */
  f?: string;
  /**
   * En una tabla de lista partida en dos mitades lado a lado («1.» a la izquierda y «21.» a la
   * derecha): de qué mitad es la celda de captura, contando desde 1 la segunda. Sin él, la primera.
   */
  g?: number;
  /**
   * En un campo que ocupa varias casillas (una fecha escrita como mes y año): cuál es esta,
   * desde 0. El valor del campo las trae unidas con «/».
   */
  p?: number;
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

/** Filas de una tabla de lista que van bajo una misma etiqueta («a. Agricultura» sobre cinco renglones). */
export interface TemplateListGroup {
  label: string;
  rows: number;
}

export interface TemplateList {
  /** Filas de la tabla. Si viene partida en dos mitades lado a lado, las de las dos. */
  rows: number;
  /** Claves de los campos que son sus columnas. */
  fields: string[];
  /** Si las filas vienen agrupadas bajo una etiqueta: cada grupo, en orden, con cuántas abarca. */
  groups?: TemplateListGroup[];
}

/**
 * Bloques repetidos de una pregunta («Programa 1» … «Programa 10»). Todos tienen la misma
 * forma, así que se describe uno. Sus campos y sus tablas son aparte de los de la pregunta:
 * las claves no se repiten entre ambos y `field.list` es la posición dentro de estas `lists`.
 */
export interface TemplateRepeat {
  /** Cuántos bloques trae el cuaderno. */
  count: number;
  /** Nombre del bloque, sin su número: «Programa». */
  title: string;
  fields: TemplateField[];
  lists: TemplateList[];
  grid: TemplateGrid;
}

export interface CompiledTemplate {
  version: number;
  kind: QuestionKind;
  /** Texto con marcadores de año: {year}, {year+1}, {year-1}. */
  text: string;
  instructions: string[];
  /** En una hoja de Complemento: número de la pregunta a la que pertenece su tabla («1.6»). */
  belongs_to?: string;
  fields: TemplateField[];
  lists: TemplateList[];
  comment: boolean;
  grid: TemplateGrid;
  /** Con bloques repetidos, `fields`, `lists` y `grid` de la pregunta suelen venir vacíos. */
  repeat?: TemplateRepeat;
}

/** Lo que vale una celda de captura contestada. Una marca con X llega como `true`. */
export type AnswerValue = string | number | boolean;

/**
 * Fila llena de una tabla de lista: `_row` es su posición (desde 1) y lo demás, sus columnas por
 * clave. En una tabla partida en dos mitades, `_row` sigue la cuenta en la segunda.
 */
export type AnswerRow = { _row: number } & Record<string, AnswerValue>;

/** Un bloque repetido que trae algo: `_block` es su número (desde 1) y lo demás usa las claves de `repeat`. */
export interface AnswerBlock {
  _block: number;
  fields: Record<string, AnswerValue>;
  lists: AnswerRow[][];
}

/**
 * Respuestas de una pregunta compiladas, siempre con la misma forma: los campos
 * sueltos por clave, una lista de filas por cada tabla de lista y el comentario.
 */
export interface CompiledAnswer {
  fields: Record<string, AnswerValue>;
  lists: AnswerRow[][];
  comment: string | null;
  /** Solo en las preguntas de bloques repetidos: un elemento por cada bloque contestado. */
  blocks?: AnswerBlock[];
}

/** Valores especiales del INEGI: se conservan como texto. */
export const SPECIAL_VALUE_LABEL: Record<string, string> = {
  NS: "No se sabe",
  NA: "No aplica",
  ND: "No disponible",
};

export const isSpecialValue = (value: AnswerValue | undefined): value is string =>
  typeof value === "string" && value in SPECIAL_VALUE_LABEL;

const numberFormat = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 6 });

/** Texto de una respuesta para mostrarla: «Sí (1)», «1,500», «X», «NS». Vacío si no hay respuesta. */
export function formatAnswerValue(field: TemplateField | undefined, value: AnswerValue | undefined): string {
  if (value === undefined || value === null) return "";
  if (value === true) return "X";
  if (value === false) return "";
  if (typeof value === "number") return numberFormat.format(value);
  if (isSpecialValue(value)) return value;
  if (field?.type === "code") {
    const option = field.options?.find((o) => o.value === value);
    if (option && option.label && option.label !== option.value) return `${option.label} (${value})`;
  }
  return value;
}

/**
 * Trozo de un valor que muestra una celda de captura. Un campo que ocupa varias casillas (una
 * fecha escrita como mes y año) llega unido con «/» («03/2025») y cada casilla muestra su parte.
 */
export function cellPiece(cell: GridCell, value: AnswerValue | undefined): AnswerValue | undefined {
  if (cell.p === undefined || value === undefined) return value;
  const piece = String(value).split("/")[cell.p]?.trim();
  return piece ? piece : undefined;
}

export const KIND_LABEL: Record<QuestionKind, string> = {
  simple: "Simple",
  list: "Tabla de lista",
  fixed: "Tabla fija",
  blocks: "Bloques repetidos",
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

// Las hojas «Complemento N» y «Adición» no traen número de pregunta: su unidad se llama C1, C2… o A1.
const SHEET_UNIT = /^([CA])(\d+)$/;

/** Número de una pregunta para mostrarlo: «1.6», o «Complemento 1» y «Adición 1» en vez de «C1» y «A1». */
export function anchorLabel(anchor: string): string {
  const unit = SHEET_UNIT.exec(anchor);
  if (!unit) return anchor;
  return `${unit[1] === "C" ? "Complemento" : "Adición"} ${unit[2]}`;
}

/** Lo mismo, con artículo, para decirlo en una frase: «la 1.6», «el Complemento 1», «la Adición 1». */
export function anchorPhrase(anchor: string): string {
  return `${SHEET_UNIT.exec(anchor)?.[1] === "C" ? "el" : "la"} ${anchorLabel(anchor)}`;
}

/** «Continúa la pregunta 1.6», en la tabla de una hoja de Complemento; vacío si no continúa a otra. */
export const continuationNote = (template: CompiledTemplate): string =>
  template.belongs_to ? `Continúa la pregunta ${anchorLabel(template.belongs_to)}` : "";

/** Todos los campos de la plantilla: los de la pregunta y los de su bloque repetido. */
export const allFields = (template: CompiledTemplate): TemplateField[] =>
  template.repeat ? [...template.fields, ...template.repeat.fields] : template.fields;

/**
 * El bloque modelo de una pregunta de bloques repetidos, visto como una plantilla: así lo
 * dibujan y lo leen las mismas vistas que a la pregunta. Null si la pregunta no trae bloques.
 */
export function blockTemplate(template: CompiledTemplate): CompiledTemplate | null {
  const { repeat } = template;
  if (!repeat) return null;

  return {
    version: template.version,
    kind: template.kind,
    text: template.text,
    instructions: [],
    fields: repeat.fields,
    lists: repeat.lists,
    comment: false,
    grid: repeat.grid,
  };
}

/** Título de un bloque repetido: «Programa 3». */
export const blockTitle = (repeat: TemplateRepeat, block: number): string => `${repeat.title} ${block}`;

/**
 * En cuántas mitades lado a lado viene cada tabla de lista en la rejilla («1.» a la izquierda y
 * «21.» a la derecha), por posición de la lista: 1 si no está partida. Sus filas físicas son
 * `rows` entre ese número, y la celda con `g` muestra la fila `i + g × filas físicas`.
 */
export function listHalves(template: CompiledTemplate): number[] {
  const listOf = new Map<string, number>();
  for (const field of template.fields) {
    if (field.list !== undefined) listOf.set(field.key, field.list);
  }

  const halves = template.lists.map(() => 1);
  for (const row of template.grid.rows) {
    for (const cell of row.cells) {
      if (cell.f === undefined || cell.g === undefined) continue;
      const list = listOf.get(cell.f);
      if (list !== undefined && list < halves.length) halves[list] = Math.max(halves[list], cell.g + 1);
    }
  }

  return halves;
}

/**
 * Grupo al que pertenece la fila `row` (desde 1) de una tabla de lista con filas agrupadas y su
 * número dentro del grupo. Si los grupos suman menos filas que la tabla (una tabla partida en
 * dos los repite en cada mitad), el patrón se repite. Null si la tabla no agrupa sus filas.
 */
export function listRowGroup(
  list: TemplateList | undefined,
  row: number,
): { label: string; position: number; rows: number } | null {
  const groups = list?.groups ?? [];
  const span = groups.reduce((sum, group) => sum + group.rows, 0);
  if (span <= 0 || row < 1) return null;

  let offset = (row - 1) % span;
  for (const group of groups) {
    if (offset < group.rows) return { label: group.label, position: offset + 1, rows: group.rows };
    offset -= group.rows;
  }
  return null;
}

/** Nombre de una fila por su grupo: «a. Agricultura · 2». Vacío si la fila no tiene grupo con etiqueta. */
export function listRowName(list: TemplateList | undefined, row: number): string {
  const group = listRowGroup(list, row);
  if (!group || group.label === "") return "";
  return group.rows > 1 ? `${group.label} · ${group.position}` : group.label;
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
