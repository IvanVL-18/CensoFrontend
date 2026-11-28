// Vista digital de las respuestas de una pregunta compilada (docs/CARGA_CENSOS.md, §7.7).
// Aquí vive la lógica que decide cómo se lee una respuesta: el desglose de una tabla fija,
// la comprobación de sus sumas, las columnas de una tabla de lista, las casillas de opción y
// los bloques repetidos. Los tipos de la plantilla y el formato de un valor están en
// compiledTemplate.ts.

import {
  fieldLabel,
  formatAnswerValue,
  listRowName,
  withYears,
  type AnswerBlock,
  type AnswerRow,
  type AnswerValue,
  type CompiledAnswer,
  type CompiledTemplate,
  type TemplateField,
  type TemplateOption,
  type TemplateRepeat,
} from "./compiledTemplate";

/** Campos sueltos: los que no son columna de una tabla de lista. */
export const looseFields = (template: CompiledTemplate): TemplateField[] =>
  template.fields.filter((field) => field.list === undefined);

/** Casilla suelta de «marque con X» con su opción impresa al lado («1. Sí», «2. No», «9. No sabe»). */
export const isOptionMark = (field: TemplateField): boolean =>
  field.list === undefined && field.type === "mark" && field.choice !== undefined;

// ───────────────────────────────────────────── desglose de una tabla fija ──

export interface BreakdownRow {
  id: string;
  /** Último tramo de la ruta: lo que se muestra. */
  label: string;
  /** Renglón y encabezados de grupo, de afuera hacia adentro. */
  path: string[];
  /** Sangría: cuántos niveles está por debajo del renglón más general. */
  depth: number;
  cells: (TemplateField | undefined)[];
}

export interface Breakdown {
  columns: string[];
  rows: BreakdownRow[];
}

const TOTAL = "Total";

const leafName = (text: string): string => (/^(sub)?total$/i.test(text.trim()) ? TOTAL : text.trim());

/**
 * Convierte los campos de una tabla fija en un desglose: cada renglón es un concepto y las
 * columnas son el último encabezado («Total», «Hombres», «Mujeres»). En el Excel una fila de
 * 24 cifras bajo encabezados de cuatro niveles obliga a leer hacia arriba; así se lee de lado.
 *
 * Devuelve null si los campos no forman una matriz (pocos campos, una sola columna, casillas
 * repetidas o demasiados huecos): entonces se muestran como ficha.
 */
export function buildBreakdown(fields: TemplateField[], editionYear: number): Breakdown | null {
  if (fields.length < 3) return null;

  const columns: string[] = [];
  const rows = new Map<string, BreakdownRow>();

  for (const field of fields) {
    const path = field.label.map((text) => withYears(text, editionYear));
    const leaf = leafName(path[path.length - 1] ?? "");
    const parts = [...(field.row_label ? [withYears(field.row_label, editionYear)] : []), ...path.slice(0, -1)];
    const id = JSON.stringify(parts);

    let column = columns.indexOf(leaf);
    if (column < 0) column = columns.push(leaf) - 1;

    let row = rows.get(id);
    if (!row) {
      row = { id, label: parts[parts.length - 1] ?? "", path: parts, depth: parts.length, cells: [] };
      rows.set(id, row);
    }
    if (row.cells[column] !== undefined) return null;
    row.cells[column] = field;
  }

  const list = [...rows.values()];
  if (list.length < 2 || columns.length < 2) return null;
  if (fields.length / (list.length * columns.length) < 0.6) return null;

  const base = Math.min(...list.map((row) => row.depth));
  for (const row of list) {
    row.depth -= base;
    for (let i = 0; i < columns.length; i++) row.cells[i] ??= undefined;
  }

  return { columns, rows: list };
}

export interface TotalsMismatch {
  row: string;
  column: string;
  /** Lo que dice la casilla. */
  stated: number;
  /** Lo que suman sus partes. */
  sum: number;
  /** «row»: total contra hombres más mujeres; «children»: renglón contra su desglose. */
  kind: "row" | "children";
}

export interface TotalsCheck {
  /** Cuántas sumas se pudieron comprobar. */
  checked: number;
  mismatches: TotalsMismatch[];
}

const SEX_SPLIT = new Set(["hombres", "mujeres", "no identificado", "no especificado"]);

const startsWith = (path: string[], prefix: string[]): boolean =>
  prefix.length < path.length && prefix.every((part, i) => path[i] === part);

/**
 * Comprueba las sumas de un desglose con lo contestado: que el total de cada renglón sea
 * hombres más mujeres y que cada renglón general sea la suma de los que lo detallan. Solo
 * compara cuando todas las partes son números; un «NS» o una casilla en blanco no se juzga.
 * Es un aviso para quien revisa, nunca un bloqueo: no todo desglose es una partición.
 */
export function checkTotals(breakdown: Breakdown, values: Readonly<Record<string, AnswerValue>>): TotalsCheck {
  const result: TotalsCheck = { checked: 0, mismatches: [] };
  const number = (field: TemplateField | undefined): number | undefined => {
    const value = field ? values[field.key] : undefined;
    return typeof value === "number" ? value : undefined;
  };
  const differs = (a: number, b: number) => Math.abs(a - b) > 1e-6;

  // Total del renglón contra el reparto por sexo. Solo cuentan las casillas que el renglón tiene:
  // una tabla puede traer además un renglón de texto («Otro tipo: especifique»).
  const total = breakdown.columns.indexOf(TOTAL);
  if (total >= 0) {
    for (const row of breakdown.rows) {
      const others = breakdown.columns.map((_, i) => i).filter((i) => i !== total && row.cells[i] !== undefined);
      const names = others.map((i) => breakdown.columns[i].toLowerCase());
      if (!names.includes("hombres") || !names.includes("mujeres") || !names.every((name) => SEX_SPLIT.has(name))) continue;

      const stated = number(row.cells[total]);
      const parts = others.map((i) => number(row.cells[i]));
      if (stated === undefined || parts.some((part) => part === undefined)) continue;
      const sum = (parts as number[]).reduce((a, b) => a + b, 0);
      result.checked++;
      if (differs(stated, sum)) {
        result.mismatches.push({ row: row.label || TOTAL, column: TOTAL, stated, sum, kind: "row" });
      }
    }
  }

  // Cada renglón contra los que lo detallan: sus descendientes más cercanos.
  for (const parent of breakdown.rows) {
    const children = breakdown.rows.filter(
      (row) =>
        startsWith(row.path, parent.path) &&
        !breakdown.rows.some((middle) => startsWith(middle.path, parent.path) && startsWith(row.path, middle.path)),
    );
    if (children.length < 2) continue;

    breakdown.columns.forEach((column, i) => {
      const stated = number(parent.cells[i]);
      // Los renglones que no tienen esa casilla no son parte de la suma.
      const parts = children.filter((child) => child.cells[i] !== undefined).map((child) => number(child.cells[i]));
      if (stated === undefined || parts.length < 2 || parts.some((part) => part === undefined)) return;
      const sum = (parts as number[]).reduce((a, b) => a + b, 0);
      result.checked++;
      if (differs(stated, sum)) {
        result.mismatches.push({ row: parent.label || TOTAL, column, stated, sum, kind: "children" });
      }
    });
  }

  return result;
}

export interface LooseView {
  /** Los campos que forman una matriz, como desglose; null si no la forman. */
  breakdown: Breakdown | null;
  /** Los que se leen como ficha: todos si no hay desglose; si lo hay, las casillas de opción. */
  ficha: TemplateField[];
  /** La ficha va antes que el desglose, como en el cuaderno. */
  fichaFirst: boolean;
}

/**
 * Cómo se leen los campos sueltos de una pregunta o de un bloque: como desglose si forman una
 * matriz y, si no, como ficha. Las casillas de opción nunca entran al desglose: son una
 * pregunta de «marque con X» y se leen en un renglón de la ficha.
 */
export function looseView(fields: TemplateField[], editionYear: number): LooseView {
  const options = fields.filter(isOptionMark);
  const rest = options.length > 0 ? fields.filter((field) => !isOptionMark(field)) : fields;
  const breakdown = buildBreakdown(rest, editionYear);

  return breakdown
    ? { breakdown, ficha: options, fichaFirst: isOptionMark(fields[0]) }
    : { breakdown: null, ficha: fields, fichaFirst: true };
}

// ───────────────────────────────────────────────────── tablas de lista ──

/** De qué pregunta se llenan solas las filas de cada tabla de lista; null si es independiente. */
export function listSources(template: CompiledTemplate): (string | null)[] {
  const listOf = new Map<string, number>();
  for (const field of template.fields) {
    if (field.list !== undefined) listOf.set(field.key, field.list);
  }

  const sources: (string | null)[] = template.lists.map(() => null);
  const seen = new Set<number>();

  for (const row of template.grid.rows) {
    let list: number | undefined;
    let source: string | undefined;
    for (const cell of row.cells) {
      if (cell.f && list === undefined) list = listOf.get(cell.f);
      if (cell.k === "d" && cell.src && source === undefined) source = cell.src;
    }
    if (list !== undefined && !seen.has(list)) {
      seen.add(list);
      sources[list] = source ?? null;
    }
  }

  return sources;
}

/**
 * Tablas de lista que son la misma tabla partida: el Excel la corta en bloques «(1 de 2)» y
 * «(2 de 2)» porque no cabe a lo ancho, o varias tablas repiten las filas de otra pregunta.
 * Devuelve grupos de posiciones de lista que se leen como una sola tabla, fila con fila.
 */
export function listGroups(template: CompiledTemplate, ownAnchor: string): number[][] {
  const sources = listSources(template);
  const groups: number[][] = [];
  const byOrigin = new Map<string, number[]>();

  template.lists.forEach((list, index) => {
    const source = sources[index];
    // Una lista independiente es su propio origen; una que copia a esta misma pregunta sigue a la primera.
    const origin = source === null ? `own:${index}` : source === ownAnchor ? "self" : `other:${source}`;
    const key = `${origin}|${list.rows}`;

    if (origin === "self") {
      const first = groups.find((group) => template.lists[group[0]].rows === list.rows);
      if (first) {
        first.push(index);
        return;
      }
    }
    const existing = origin.startsWith("other:") ? byOrigin.get(key) : undefined;
    if (existing) {
      existing.push(index);
      return;
    }
    const group = [index];
    groups.push(group);
    byOrigin.set(key, group);
  });

  return groups;
}

export interface ListColumn {
  id: string;
  label: string;
  /** Varias casillas seguidas con el mismo encabezado se leen como una sola columna. */
  fields: TemplateField[];
}

const BLOCK_MARK = /^\(\s*\d+\s+de\s+\d+\s*\)\s*(›\s*)?/;

const sameKind = (a: TemplateField, b: TemplateField): boolean =>
  a.type === b.type && (a.type !== "mark" || Boolean(a.choice) === Boolean(b.choice));

/**
 * Columnas de una tabla de lista para leerla en pantalla. Las casillas seguidas con el mismo
 * encabezado se juntan: quince columnas de «marque con X» del mismo catálogo son una columna
 * que dice qué opciones se marcaron.
 */
export function listColumns(template: CompiledTemplate, lists: number[], editionYear: number): ListColumn[] {
  const byKey = new Map(template.fields.map((field) => [field.key, field]));
  const columns: ListColumn[] = [];

  for (const index of lists) {
    for (const key of template.lists[index]?.fields ?? []) {
      const field = byKey.get(key);
      if (!field) continue;
      const label = fieldLabel(field, editionYear).replace(BLOCK_MARK, "") || "Respuesta";
      const last = columns[columns.length - 1];
      if (last && last.label === label && sameKind(last.fields[0], field)) last.fields.push(field);
      else columns.push({ id: key, label, fields: [field] });
    }
  }

  return columns;
}

/** Lo que dice una columna en una fila: la etiqueta de un código, las opciones marcadas, la cifra. */
export function listCellText(column: ListColumn, row: AnswerRow | undefined): string {
  if (!row) return "";

  const parts: string[] = [];
  for (const field of column.fields) {
    const value = row[field.key];
    if (value === undefined || value === false) continue;
    if (field.type === "mark" && value === true) {
      parts.push(field.choice ? field.choice.label || `Opción ${field.choice.value}` : "X");
    } else {
      const text = formatAnswerValue(field, value);
      if (text !== "") parts.push(text);
    }
  }

  return parts.join(column.fields.length > 1 ? ", " : "");
}

/** Filas con respuesta de un grupo de listas, por posición: la fila N de cada bloque es la misma. */
export function mergedRows(lists: number[], answers: AnswerRow[][]): AnswerRow[] {
  const rows = new Map<number, AnswerRow>();
  for (const index of lists) {
    for (const row of answers[index] ?? []) {
      rows.set(row._row, { ...(rows.get(row._row) ?? { _row: row._row }), ...row });
    }
  }

  return [...rows.values()].sort((a, b) => a._row - b._row);
}

/**
 * Nombre de una fila por el grupo de filas al que pertenece («a. Agricultura · 2»), en un grupo
 * de listas que se leen como una sola tabla. Vacío si ninguna agrupa sus filas. Se usa igual
 * que el nombre que viene de otra pregunta.
 */
export function groupedRowName(template: CompiledTemplate, lists: number[], row: number): string {
  for (const index of lists) {
    const name = listRowName(template.lists[index], row);
    if (name !== "") return name;
  }
  return "";
}

// ─────────────────────────────────────────────────────────────── ficha ──

export interface FichaItem {
  id: string;
  label: string;
  /** Un campo, o varias marcas del mismo encabezado que se leen juntas. */
  fields: TemplateField[];
}

const samePath = (a: TemplateField, b: TemplateField): boolean =>
  a.label.length === b.label.length && a.label.every((text, index) => text === b.label[index]);

const squash = (text: string): string => text.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Renglón de una casilla de opción cuando no es el nombre de la opción misma. En los cuadernos
 * sin protección el renglón de la casilla es su opción («Sí»); en una tabla fija con columnas
 * numeradas, es el concepto de la fila, y cada fila es una pregunta de opción distinta.
 */
const optionRow = (field: TemplateField): string =>
  field.row_label && field.choice && squash(field.row_label) !== squash(field.choice.label) ? field.row_label : "";

const sameOption = (a: TemplateField, b: TemplateField): boolean => samePath(a, b) && optionRow(a) === optionRow(b);

/**
 * Campos sueltos para mostrarlos como ficha («etiqueta: respuesta»). Las marcas con X que
 * comparten encabezado se juntan en un renglón que dice cuáles se marcaron. Las casillas de
 * opción seguidas con la misma ruta de encabezados son una sola pregunta de opción y se leen
 * bajo su último encabezado.
 */
export function fichaItems(fields: TemplateField[], editionYear: number): FichaItem[] {
  const items: FichaItem[] = [];

  for (const field of fields) {
    if (field.type === "mark") {
      const option = isOptionMark(field);
      if (option) {
        // Las casillas de una misma pregunta de opción pueden traer otro campo en medio
        // («1. Sí», el número de programas, «2. No»): se juntan con las de su misma ruta.
        const open = [...items]
          .reverse()
          .find((item) => isOptionMark(item.fields[0]) && sameOption(item.fields[0], field));
        // Si la opción ya está en el renglón, empieza otra pregunta con las mismas opciones.
        if (open && !open.fields.some((other) => other.choice?.value === field.choice?.value)) {
          open.fields.push(field);
          continue;
        }
      }
      const last: FichaItem | undefined = items[items.length - 1];
      if (!option && last && last.fields[0].type === "mark" && !isOptionMark(last.fields[0]) && samePath(last.fields[0], field)) {
        last.fields.push(field);
        continue;
      }
      const path = field.label.map((text) => withYears(text, editionYear));
      // Una pregunta de opción se lee bajo su último encabezado y, si es la fila de una tabla, con su
      // concepto. Las demás marcas, bajo toda su ruta.
      const label = option
        ? [path[path.length - 1] ?? "", withYears(optionRow(field), editionYear)].filter((text) => text !== "").join(" · ")
        : path.join(" › ");
      items.push({ id: field.key, label, fields: [field] });
      continue;
    }
    items.push({ id: field.key, label: fieldLabel(field, editionYear), fields: [field] });
  }

  return items;
}

/** Una opción marcada, en palabras y con su número, como se lee un código de catálogo: «Sí (1)». */
const choiceText = (choice: TemplateOption): string =>
  choice.label && choice.label !== choice.value ? `${choice.label} (${choice.value})` : `Opción ${choice.value}`;

/** Texto de un renglón de la ficha. Para las marcas, las opciones marcadas; vacío si no hay ninguna. */
export function fichaText(item: FichaItem, values: Readonly<Record<string, AnswerValue>>): string {
  if (item.fields[0].type !== "mark") return formatAnswerValue(item.fields[0], values[item.fields[0].key]);

  const marked: string[] = [];
  for (const field of item.fields) {
    const value = values[field.key];
    if (value === undefined || value === false) continue;
    const name =
      isOptionMark(field) && field.choice
        ? choiceText(field.choice)
        : field.choice?.label || field.row_label || (field.choice ? `Opción ${field.choice.value}` : "");
    if (value === true) marked.push(name || "X");
    else marked.push(name ? `${name}: ${String(value)}` : String(value));
  }

  return marked.join(", ");
}

// ──────────────────────────────────────────────────── bloques repetidos ──

/** Bloques repetidos que traen algo, por su número. */
export const answeredBlocks = (answer: Pick<CompiledAnswer, "blocks">): AnswerBlock[] =>
  [...(answer.blocks ?? [])].sort((a, b) => a._block - b._block);

/** Plural en minúsculas del nombre de un bloque: «Programa» → «programas», «Acción» → «acciones». */
function pluralTitle(title: string): string {
  const word = title.trim().toLowerCase();
  // Un nombre de varias palabras no se pluraliza con una regla: se dice «bloques».
  if (word === "" || /\s/.test(word)) return "bloques";
  if (/[aeiou]$/.test(word)) return `${word}s`;
  if (/z$/.test(word)) return `${word.slice(0, -1)}ces`;
  const accents: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u" };
  const sharp = /([áéíóú])([ns])$/.exec(word);
  if (sharp) return `${word.slice(0, -2)}${accents[sharp[1]]}${sharp[2]}es`;
  return /[áéíóú]$/.test(word) ? `${word}s` : `${word}es`;
}

/** Cuántos bloques repetidos traen respuesta: «3 de 10 programas con respuesta». */
export function blocksSummary(repeat: TemplateRepeat, answered: number): string {
  const count = repeat.count.toLocaleString("es-MX");
  return `${answered.toLocaleString("es-MX")} de ${count} ${pluralTitle(repeat.title)} con respuesta`;
}
