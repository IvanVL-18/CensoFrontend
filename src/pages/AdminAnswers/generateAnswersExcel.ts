import ExcelJS from "exceljs";
import type { GetAnswersResponse, QuestionItem } from "./AdminAnswers.types";
import { evaluateOperations } from "../../lib/formioOperations";
import { htmlToText, shouldShowLabel } from "../../lib/formioText";

// ── Palette ───────────────────────────────────────────────────────────────────
const MAROON_HEX  = "7A0C2E";
const HEADER_FONT = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } } as const;
const BODY_FONT   = { name: "Calibri", size: 10 } as const;
const LABEL_FONT  = { name: "Calibri", size: 10, bold: true } as const;

const MAROON_FILL: ExcelJS.Fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + MAROON_HEX } };
const ALT_FILL:    ExcelJS.Fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF0F3" } };
const INFO_FILL:   ExcelJS.Fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F8" } };
const TOTAL_FILL:  ExcelJS.Fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };

const THIN: ExcelJS.Border = { style: "thin", color: { argb: "FFDDDDDD" } };
const ALL_BORDERS: Partial<ExcelJS.Borders> = { top: THIN, left: THIN, bottom: THIN, right: THIN };

// ── Schema helpers (mirrors generateAnswersPdf logic) ────────────────────────

// content/htmlelement NO se saltan: ahí viven los nombres reales de los campos
const SKIP = new Set(["button", "file", "signature"]);

type FlatComp = {
  key:    string;
  label:  string;
  type:   string;
  values: { label: string; value: string }[];
};

function extractLeafComponents(components: any[]): FlatComp[] {
  if (!Array.isArray(components)) return [];
  const result: FlatComp[] = [];
  for (const c of components) {
    if (!c || c.hidden === true) continue;
    if (c.input === true && c.key && !SKIP.has(c.type)) {
      result.push({
        key: c.key,
        // label real; si está oculto o es el default de Form.io, usa la key
        label: shouldShowLabel(c) ? String(c.label).trim() : c.key,
        type: c.type,
        values: c.data?.values ?? c.values ?? [],
      });
    }
    if (Array.isArray(c.components) && c.type !== "datagrid" && c.type !== "editgrid")
      result.push(...extractLeafComponents(c.components));
    if (Array.isArray(c.columns))
      for (const col of c.columns) result.push(...extractLeafComponents(col.components ?? []));
    if (Array.isArray(c.rows))
      for (const row of c.rows)
        if (Array.isArray(row))
          for (const cell of row) result.push(...extractLeafComponents(cell.components ?? []));
  }
  return result;
}

function formatFieldValue(comp: any, rawValue: any): string {
  if (rawValue === null || rawValue === undefined || rawValue === "") return "";
  const vals: { value: string; label: string }[] = comp.data?.values ?? comp.values ?? [];
  switch (comp.type) {
    case "select":
    case "radio": {
      const opt = vals.find((v) => v.value === String(rawValue));
      return opt?.label ?? String(rawValue);
    }
    case "selectboxes": {
      if (typeof rawValue === "object" && !Array.isArray(rawValue)) {
        const checked = vals.filter((v) => rawValue[v.value]).map((v) => v.label);
        if (checked.length) return checked.join(", ");
        // if vals is empty, check the object keys
        return Object.entries(rawValue).filter(([, v]) => v).map(([k]) => k).join(", ") || "—";
      }
      return String(rawValue);
    }
    case "checkbox":
      return rawValue ? "Sí" : "No";
    case "number":
    case "currency":
      return typeof rawValue === "number" ? rawValue.toLocaleString("es-MX") : String(rawValue);
    default:
      if (Array.isArray(rawValue)) return rawValue.join(", ");
      if (typeof rawValue === "object") return JSON.stringify(rawValue);
      return String(rawValue);
  }
}

/** Valor para la celda: número real en campos numéricos (permite sumar en Excel). */
function excelValue(comp: any, raw: any): string | number {
  if (comp.type === "number" || comp.type === "currency") {
    const n = typeof raw === "number" ? raw : raw !== "" && raw != null ? Number(raw) : NaN;
    if (!isNaN(n)) return n;
  }
  return formatFieldValue(comp, raw) || "—";
}

// ── Extracción de campos con sus nombres reales ───────────────────────────────
// Las preguntas del censo suelen ocultar el label del input (hideLabel o el
// default "Number"/"Text Field") y poner el texto real en componentes
// content/htmlelement vecinos. Estas heurísticas recuperan ese texto:
//   1. Fila de encabezados: un columns donde todas las columnas son content
//      ("Total | Hombres | Mujeres") etiqueta por posición a la siguiente
//      fila de inputs.
//   2. Content adyacente: un content pegado arriba —o en la columna a la
//      izquierda— de un campo sin label se usa como su nombre.
//   3. Encabezados de grupo ("Pertenecen a pueblo indígena") se anteponen:
//      "Pertenecen a pueblo indígena › Subtotal".

type FieldPair = { label: string; value: string | number };

const MAX_GROUP_LEN = 80;

const isContentComp = (c: any) => c?.type === "content" || c?.type === "htmlelement";
const contentTextOf = (c: any): string => htmlToText(c?.html ?? c?.content ?? "");
const isVisible = (c: any) => c && c.hidden !== true && !SKIP.has(c.type);
const isLeafInput = (c: any) =>
  c?.input === true && c?.key &&
  c.type !== "datagrid" && c.type !== "editgrid" && c.type !== "container";

/** Texto si la columna solo contiene componentes de contenido; null si no. */
function contentOnlyColumnText(col: any): string | null {
  const comps = (col?.components ?? []).filter(isVisible);
  if (!comps.length) return null;
  if (!comps.every(isContentComp)) return null;
  const t = comps.map(contentTextOf).filter(Boolean).join(" ").trim();
  return t || null;
}

function extractDisplayFields(
  components: any[],
  submission: any,
  group: string | null = null,
  initialLabel: string | null = null,
): FieldPair[] {
  const result: FieldPair[] = [];
  if (!Array.isArray(components)) return result;

  // Encabezados de una fila de contents, aplicables a la siguiente fila de inputs
  let pendingHeaders: (string | null)[] | null = null;
  // Último content consumible como nombre del siguiente campo sin label
  let pendingLabel = initialLabel;
  // Encabezado de grupo activo (se antepone con "›")
  let currentGroup = group;

  const withGroup = (label: string) =>
    currentGroup ? `${currentGroup} › ${label}` : label;

  const labelFor = (comp: any): string => {
    if (shouldShowLabel(comp)) return withGroup(String(comp.label).trim());
    if (pendingLabel) {
      const consumed = pendingLabel;
      pendingLabel = null;
      return withGroup(consumed);
    }
    return withGroup(String(comp.label || comp.key || "Campo").trim());
  };

  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (!comp || comp.hidden === true || SKIP.has(comp.type)) continue;

    // ── Contenido: nombre del siguiente campo o encabezado de grupo ─────────
    if (isContentComp(comp)) {
      const text = contentTextOf(comp);
      if (!text) continue;
      const next = components.slice(i + 1).find(isVisible);
      if (next && isLeafInput(next) && !shouldShowLabel(next)) {
        pendingLabel = text;
      } else if (text.length <= MAX_GROUP_LEN) {
        currentGroup = text;
      }
      continue;
    }

    // ── Columns ──────────────────────────────────────────────────────────────
    if (comp.type === "columns" && Array.isArray(comp.columns)) {
      const headerTexts: (string | null)[] = comp.columns.map(contentOnlyColumnText);
      const nonEmpty = comp.columns.filter((col: any) =>
        (col?.components ?? []).some(isVisible)
      );
      const contentCols = headerTexts.filter((t): t is string => t !== null);

      if (nonEmpty.length > 0 && contentCols.length === nonEmpty.length) {
        // Fila compuesta solo de textos
        if (contentCols.length === 1) {
          if (contentCols[0].length <= MAX_GROUP_LEN) currentGroup = contentCols[0];
        } else {
          pendingHeaders = headerTexts;
        }
        continue;
      }

      // Fila con campos: cada columna usa su encabezado pendiente, o el
      // content de la columna a su izquierda, como nombre de respaldo
      comp.columns.forEach((col: any, ci: number) => {
        if (headerTexts[ci] !== null) return; // columna de solo texto: es label de la de al lado
        const fallback = pendingHeaders?.[ci] ?? (ci > 0 ? headerTexts[ci - 1] : null);
        result.push(
          ...extractDisplayFields(col.components ?? [], submission, currentGroup, fallback)
        );
      });
      pendingHeaders = null;
      continue;
    }

    // ── Datagrid / editgrid ─────────────────────────────────────────────────
    if (comp.type === "datagrid" || comp.type === "editgrid") {
      const rows: any[] = submission?.[comp.key] ?? [];
      const cols = extractLeafComponents(comp.components ?? []);
      const gridName = shouldShowLabel(comp) ? String(comp.label).trim() : pendingLabel ?? comp.key;
      pendingLabel = null;
      if (rows.length === 0) {
        result.push({ label: withGroup(gridName), value: "Sin registros" });
      } else {
        rows.forEach((row, ri) => {
          for (const col of cols) {
            result.push({
              label: withGroup(`${gridName} [${ri + 1}] › ${col.label}`),
              value: excelValue(col, row?.[col.key]),
            });
          }
        });
      }
      continue;
    }

    // ── Container: input:true pero los hijos tienen los datos ───────────────
    if (comp.type === "container") {
      const nested =
        submission?.[comp.key] != null && typeof submission[comp.key] === "object"
          ? submission[comp.key]
          : submission;
      result.push(...extractDisplayFields(comp.components ?? [], nested, currentGroup));
      continue;
    }

    // ── Tabs: cada tab usa su label como grupo ──────────────────────────────
    if (comp.type === "tabs") {
      for (const tab of comp.components ?? []) {
        const tabLabel = String(tab?.label ?? "").trim();
        const tabGroup = tabLabel && tabLabel.length <= MAX_GROUP_LEN ? tabLabel : currentGroup;
        result.push(...extractDisplayFields(tab.components ?? [], submission, tabGroup));
      }
      continue;
    }

    // ── Selectboxes ─────────────────────────────────────────────────────────
    if (comp.type === "selectboxes") {
      const raw  = submission?.[comp.key] ?? {};
      const vals: { value: string; label: string }[] = comp.data?.values ?? comp.values ?? [];
      const checked = vals.length
        ? vals.filter((v) => raw[v.value]).map((v) => v.label)
        : Object.entries(raw).filter(([, v]) => v).map(([k]) => k);
      result.push({ label: labelFor(comp), value: checked.join(", ") || "—" });
      continue;
    }

    // ── Layout genérico (panel, fieldset, well, table) ──────────────────────
    if (!comp.input) {
      const panelTitle = String(comp.title ?? comp.legend ?? "").trim();
      const layoutGroup =
        panelTitle && panelTitle.length <= MAX_GROUP_LEN ? panelTitle : currentGroup;
      if (Array.isArray(comp.components))
        result.push(...extractDisplayFields(comp.components, submission, layoutGroup));
      if (Array.isArray(comp.rows))
        for (const row of comp.rows)
          if (Array.isArray(row))
            for (const cell of row)
              result.push(
                ...extractDisplayFields(cell.components ?? [], submission, layoutGroup)
              );
      continue;
    }

    // ── Campo hoja ──────────────────────────────────────────────────────────
    if (comp.input === true && comp.key) {
      result.push({ label: labelFor(comp), value: excelValue(comp, submission?.[comp.key]) });
    }
  }

  return result;
}

// ── Submission builder ────────────────────────────────────────────────────────

type OpConfig = { label: string; expression: string };

interface ParsedSubmissions {
  components:  any[];
  submissions: any[];
  operations:  OpConfig[];
  isRepeat:    boolean;
}

function buildSubmissions(question: QuestionItem): ParsedSubmissions | null {
  const raw = (question as any).question_structure ?? null;
  if (!raw) return null;
  try {
    const schema: any = typeof raw === "string" ? JSON.parse(raw) : { ...raw };
    const components  = schema.components ?? [];
    const rc          = schema.repeat_config;

    let rawSubs: any[];
    try {
      const parsed = JSON.parse(question.answer?.answer ?? "{}");
      rawSubs = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      rawSubs = [{}];
    }

    let submissions: any[];
    if (rc?.repeat && rc.data_repeat_type === "array" && Array.isArray(rc.data_repeat_config)) {
      submissions = rc.data_repeat_config.map((item: any, i: number) => ({ ...item, ...(rawSubs[i] ?? {}) }));
    } else {
      submissions = rawSubs;
    }

    const isRepeat = rc?.repeat === true && submissions.length > 1;
    return { components, submissions, operations: schema.operations ?? [], isRepeat };
  } catch {
    return null;
  }
}

// ── Row builder ───────────────────────────────────────────────────────────────
// Operaciones: motor compartido en src/lib/formioOperations.ts

interface ExcelRow {
  modulo:        string;
  seccion:       string;
  indice:        string;
  pregunta:      string;
  instrucciones: string;
  campo:         string;
  respuesta:     string | number;
  registro:      string | number;
  esTotalRow?:   boolean;
  qShade?:       boolean; // sombreado alternado por pregunta (no por fila)
}

function buildRows(data: GetAnswersResponse): ExcelRow[] {
  const rows: ExcelRow[] = [];
  let qCount = 0;

  for (const mod of data.modules) {
    for (const sec of mod.sections) {
      for (const q of sec.questions) {
        const qShade = qCount % 2 === 1;
        qCount++;

        const base = {
          modulo:        `${mod.index}: ${mod.name}`,
          seccion:       `${sec.index}: ${sec.name}`,
          indice:        q.index,
          pregunta:      q.name,
          instrucciones: q.instructions ?? "",
          qShade,
        };

        // ── Sin respuesta ────────────────────────────────────────────────────
        if (!q.answer) {
          rows.push({ ...base, campo: "—", respuesta: "Sin respuesta", registro: "—" });
          continue;
        }

        // ── Sin schema (respuesta de texto plano) ────────────────────────────
        const parsed = buildSubmissions(q);
        if (!parsed) {
          rows.push({ ...base, campo: "—", respuesta: q.answer.answer, registro: "—" });
          continue;
        }

        const before = rows.length; // para detectar si se agregó algo

        if (!parsed.isRepeat) {
          // ── Pregunta simple ────────────────────────────────────────────────
          const fields = extractDisplayFields(parsed.components, parsed.submissions[0]);
          for (const f of fields) {
            rows.push({ ...base, campo: f.label, respuesta: f.value, registro: "—" });
          }
        } else {
          // ── Pregunta repetida ──────────────────────────────────────────────
          for (let i = 0; i < parsed.submissions.length; i++) {
            const fields = extractDisplayFields(parsed.components, parsed.submissions[i]);
            for (const f of fields) {
              rows.push({ ...base, campo: f.label, respuesta: f.value, registro: i + 1 });
            }
          }
        }

        // ── Totales (también en preguntas simples con operaciones) ───────────
        for (const r of evaluateOperations(parsed.operations, parsed.submissions)) {
          rows.push({
            ...base,
            campo: `Total › ${r.label}`,
            respuesta: r.result,
            registro: "Total",
            esTotalRow: true,
          });
        }

        // ── Garantía: si el schema no produjo ninguna fila, muestra la respuesta cruda
        if (rows.length === before) {
          rows.push({ ...base, campo: "—", respuesta: q.answer.answer, registro: "—" });
        }
      }
    }
  }

  return rows;
}

// ── Excel builder ─────────────────────────────────────────────────────────────

function applyBorders(cell: ExcelJS.Cell) {
  cell.border = ALL_BORDERS;
}

function headerCell(cell: ExcelJS.Cell, value: string) {
  cell.value      = value;
  cell.font       = HEADER_FONT;
  cell.fill       = MAROON_FILL;
  cell.alignment  = { vertical: "middle", horizontal: "center", wrapText: true };
  applyBorders(cell);
}

// Sin wrapText y con altura fija: las filas se mantienen compactas (una línea);
// el texto completo sigue en la celda y se ve al seleccionarla o ensanchar la columna
function dataCell(cell: ExcelJS.Cell, value: string | number) {
  cell.value     = value;
  cell.font      = BODY_FONT;
  cell.alignment = { vertical: "middle", wrapText: false };
  if (typeof value === "number") {
    cell.alignment = { vertical: "middle", horizontal: "right" };
    cell.numFmt    = "#,##0.##";
  }
  applyBorders(cell);
}

export async function generateAnswersExcel(data: GetAnswersResponse): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "CensoCitnova";
  wb.created  = new Date();

  // ── Sheet 1: Información ─────────────────────────────────────────────────
  const infoSheet = wb.addWorksheet("Información");
  infoSheet.columns = [{ width: 20 }, { width: 60 }];

  const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

  // Title
  infoSheet.mergeCells("A1:B1");
  const titleCell = infoSheet.getCell("A1");
  titleCell.value     = "REPORTE DE RESPUESTAS DE CENSO";
  titleCell.font      = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill      = MAROON_FILL;
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.border    = ALL_BORDERS;
  infoSheet.getRow(1).height = 28;

  const allQuestions = data.modules.flatMap((m) => m.sections.flatMap((s) => s.questions));
  const answered     = allQuestions.filter((q) => q.answer).length;
  const pct          = allQuestions.length
    ? Math.round((answered / allQuestions.length) * 100)
    : 0;

  const infoData: [string, string][] = [
    ["Censo",        data.census.name],
    ["Institución",  data.institution.name],
    ["Usuario",      `${data.user.name} ${data.user.lastname}`],
    ["Correo",       data.user.email],
    ["Período",      `${data.census.init_date} — ${data.census.deadline}`],
    ["Generado",     today],
    ["Avance",       `${answered} de ${allQuestions.length} preguntas respondidas (${pct}%)`],
  ];

  infoData.forEach(([label, value], i) => {
    const row = infoSheet.getRow(i + 2);
    row.height = 20;
    const lCell = row.getCell(1);
    lCell.value     = label;
    lCell.font      = LABEL_FONT;
    lCell.fill      = INFO_FILL;
    lCell.alignment = { vertical: "middle" };
    lCell.border    = ALL_BORDERS;
    const vCell = row.getCell(2);
    vCell.value     = value;
    vCell.font      = BODY_FONT;
    vCell.alignment = { vertical: "middle", wrapText: true };
    vCell.border    = ALL_BORDERS;
  });

  // ── Sheet 2: Respuestas ──────────────────────────────────────────────────
  const ws = wb.addWorksheet("Respuestas");

  const COLS: { header: string; key: keyof ExcelRow; width: number }[] = [
    { header: "Módulo",         key: "modulo",        width: 26 },
    { header: "Sección",        key: "seccion",       width: 26 },
    { header: "#",              key: "indice",        width: 8  },
    { header: "Pregunta",       key: "pregunta",      width: 38 },
    { header: "Instrucciones",  key: "instrucciones", width: 28 },
    { header: "Campo",          key: "campo",         width: 42 },
    { header: "Respuesta",      key: "respuesta",     width: 40 },
    { header: "Registro",       key: "registro",      width: 10 },
  ];

  ws.columns = COLS.map(({ width }) => ({ width }));

  // Header row
  const hRow = ws.getRow(1);
  hRow.height = 22;
  COLS.forEach(({ header }, ci) => headerCell(hRow.getCell(ci + 1), header));
  hRow.commit();

  // Freeze header row
  ws.views = [{ state: "frozen", ySplit: 1 }];

  // Auto-filter
  ws.autoFilter = { from: "A1", to: "H1" };

  // Data rows — sombreado alternado por PREGUNTA (bloques legibles),
  // altura fija para que las filas queden compactas (sin expandirse)
  const rows = buildRows(data);

  rows.forEach((r, ri) => {
    const wsRow = ws.getRow(ri + 2);
    wsRow.height = 18;
    const isTotal = !!r.esTotalRow;

    COLS.forEach(({ key }, ci) => {
      const cell  = wsRow.getCell(ci + 1);
      const value = r[key] as string | number;
      dataCell(cell, value ?? "");

      if (isTotal) {
        cell.fill = TOTAL_FILL;
        cell.font = { ...BODY_FONT, bold: true, color: { argb: "FF1D4ED8" } };
      } else if (r.qShade) {
        cell.fill = ALT_FILL;
      }
    });

    wsRow.commit();
  });

  // ── Download ─────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const safe = (s: string) => s.replace(/\s+/g, "_").replace(/[^\w]/g, "");
  a.href     = url;
  a.download = `respuestas_${safe(data.user.lastname)}_${safe(data.user.name)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
