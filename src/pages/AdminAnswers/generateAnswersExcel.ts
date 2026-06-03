import ExcelJS from "exceljs";
import type { GetAnswersResponse, QuestionItem } from "./AdminAnswers.types";

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

const SKIP = new Set(["button", "htmlelement", "content", "file", "signature"]);

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
    if (!c) continue;
    if (c.input === true && c.key && !SKIP.has(c.type)) {
      result.push({ key: c.key, label: c.label || c.key, type: c.type, values: c.data?.values ?? c.values ?? [] });
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

// ── Flat field extraction from a single submission object ─────────────────────

type FieldPair = { label: string; value: string };

function extractDisplayFields(components: any[], submission: any): FieldPair[] {
  const result: FieldPair[] = [];
  for (const comp of components) {
    if (!comp || SKIP.has(comp.type)) continue;

    // ── Data tables ───────────────────────────────────────────────────────────
    if (comp.type === "datagrid" || comp.type === "editgrid") {
      const rows: any[] = submission?.[comp.key] ?? [];
      const cols = extractLeafComponents(comp.components ?? []);
      if (rows.length === 0) {
        result.push({ label: comp.label || comp.key, value: "Sin registros" });
      } else {
        for (let ri = 0; ri < rows.length; ri++) {
          for (const col of cols) {
            result.push({
              label: `${comp.label || comp.key} [${ri + 1}] › ${col.label}`,
              value: formatFieldValue(col, rows[ri]?.[col.key]) || "—",
            });
          }
        }
      }
      continue;
    }

    // ── Container: input:true but children hold the real data ─────────────────
    if (comp.type === "container") {
      const nested =
        submission?.[comp.key] != null && typeof submission[comp.key] === "object"
          ? submission[comp.key]
          : submission;
      result.push(...extractDisplayFields(comp.components ?? [], nested));
      continue;
    }

    // ── Selectboxes ───────────────────────────────────────────────────────────
    if (comp.type === "selectboxes") {
      const raw  = submission?.[comp.key] ?? {};
      const vals: { value: string; label: string }[] = comp.data?.values ?? comp.values ?? [];
      const checked = vals.length
        ? vals.filter((v) => raw[v.value]).map((v) => v.label)
        : Object.entries(raw).filter(([, v]) => v).map(([k]) => k);
      result.push({ label: comp.label || comp.key, value: checked.join(", ") || "—" });
      continue;
    }

    // ── Tabs: components is an array of tab objects, not fields ───────────────
    if (comp.type === "tabs") {
      for (const tab of comp.components ?? []) {
        result.push(...extractDisplayFields(tab.components ?? [], submission));
      }
      continue;
    }

    // ── Generic layout containers (panel, fieldset, well, columns, table) ─────
    if (!comp.input) {
      if (Array.isArray(comp.components))
        result.push(...extractDisplayFields(comp.components, submission));
      if (Array.isArray(comp.columns))
        for (const col of comp.columns)
          result.push(...extractDisplayFields(col.components ?? [], submission));
      if (Array.isArray(comp.rows))
        for (const row of comp.rows)
          if (Array.isArray(row))
            for (const cell of row)
              result.push(...extractDisplayFields(cell.components ?? [], submission));
      continue;
    }

    // ── Leaf input field ──────────────────────────────────────────────────────
    if (comp.input === true && comp.key) {
      result.push({
        label: comp.label || comp.key,
        value: formatFieldValue(comp, submission?.[comp.key]) || "—",
      });
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

// ── Math operations ───────────────────────────────────────────────────────────

function parseExpr(expr: string) {
  const m = expr.match(/(\w+)\(([^,]*)(?:,\s*([^)]+))?\)/);
  if (!m) return null;
  return { op: m[1].toUpperCase(), variable: m[2]?.trim() || null, cond: m[3]?.trim() || null };
}

function extractNums(data: any[], variable: string): number[] {
  return data.map((e) => e?.[variable]).filter((v) => v !== null && v !== undefined && v !== "").map(Number).filter((v) => !isNaN(v));
}

function evalCond(record: any, cond: string): boolean {
  try {
    const keys = Object.keys(record);
    // eslint-disable-next-line no-new-func
    return new Function(...keys, `return ${cond};`)(...keys.map((k) => record[k]));
  } catch { return false; }
}

function filterByCond(data: any[], variable: string, cond: string): number[] {
  return data.filter((r) => evalCond(r, cond)).map((r) => r?.[variable]).filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
}

function evaluateOperations(ops: OpConfig[], submissions: any[]): { label: string; result: string }[] {
  if (!ops?.length || !submissions?.length) return [];
  return ops.map(({ label, expression }) => {
    const p = parseExpr(expression);
    if (!p) return { label, result: "—" };
    const values = p.cond && p.variable
      ? filterByCond(submissions, p.variable, p.cond)
      : p.variable ? extractNums(submissions, p.variable) : [];
    let result: number | string;
    switch (p.op) {
      case "SUMAR":    case "SUMARSI":    result = values.reduce((a, b) => a + b, 0); break;
      case "CONTAR":   case "CONTARSI":   result = values.length; break;
      case "PROMEDIAR":case "PROMEDIARSI":result = values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0; break;
      case "MAX":      case "MAXSI":      result = values.length ? Math.max(...values) : 0; break;
      case "MIN":      case "MINSI":      result = values.length ? Math.min(...values) : 0; break;
      default: result = "N/D";
    }
    return { label, result: String(result) };
  });
}

// ── Row builder ───────────────────────────────────────────────────────────────

interface ExcelRow {
  modulo:        string;
  seccion:       string;
  indice:        string;
  pregunta:      string;
  instrucciones: string;
  campo:         string;
  respuesta:     string;
  registro:      string | number;
  esTotalRow?:   boolean;
}

function buildRows(data: GetAnswersResponse): ExcelRow[] {
  const rows: ExcelRow[] = [];

  for (const mod of data.modules) {
    for (const sec of mod.sections) {
      for (const q of sec.questions) {
        const base = {
          modulo:        `${mod.index}: ${mod.name}`,
          seccion:       `${sec.index}: ${sec.name}`,
          indice:        q.index,
          pregunta:      q.name,
          instrucciones: q.instructions ?? "",
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
          // Totales
          const opResults = evaluateOperations(parsed.operations, parsed.submissions);
          for (const r of opResults) {
            rows.push({
              ...base,
              campo: `Total › ${r.label}`,
              respuesta: r.result,
              registro: "Total",
              esTotalRow: true,
            });
          }
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

function dataCell(cell: ExcelJS.Cell, value: string | number, bold = false) {
  cell.value     = value;
  cell.font      = bold ? { ...BODY_FONT, bold: true } : BODY_FONT;
  cell.alignment = { vertical: "top", wrapText: true };
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

  const infoData: [string, string][] = [
    ["Censo",        data.census.name],
    ["Institución",  data.institution.name],
    ["Usuario",      `${data.user.name} ${data.user.lastname}`],
    ["Correo",       data.user.email],
    ["Período",      `${data.census.init_date} — ${data.census.deadline}`],
    ["Generado",     today],
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
    { header: "Módulo",         key: "modulo",        width: 28 },
    { header: "Sección",        key: "seccion",       width: 28 },
    { header: "#",              key: "indice",        width: 8  },
    { header: "Pregunta",       key: "pregunta",      width: 38 },
    { header: "Instrucciones",  key: "instrucciones", width: 30 },
    { header: "Campo",          key: "campo",         width: 32 },
    { header: "Respuesta",      key: "respuesta",     width: 42 },
    { header: "Registro",       key: "registro",      width: 12 },
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
  ws.autoFilter = { from: "A1", to: `H1` };

  // Data rows
  const rows = buildRows(data);

  rows.forEach((r, ri) => {
    const wsRow = ws.getRow(ri + 2);
    wsRow.height = 18;
    const isAlt   = ri % 2 === 1;
    const isTotal = !!r.esTotalRow;

    COLS.forEach(({ key }, ci) => {
      const cell  = wsRow.getCell(ci + 1);
      const value = r[key] as string | number;
      dataCell(cell, value ?? "");

      if (isTotal) {
        cell.fill = TOTAL_FILL;
        cell.font = { ...BODY_FONT, bold: true, color: { argb: "FF1D4ED8" } };
      } else if (isAlt) {
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
