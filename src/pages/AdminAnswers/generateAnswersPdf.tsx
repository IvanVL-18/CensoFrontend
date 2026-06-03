import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { GetAnswersResponse, QuestionItem } from "./AdminAnswers.types";

// ── Palette ───────────────────────────────────────────────────────────────────
const MAROON  = "#7A0C2E";
const BLUE    = "#1D4ED8";
const BLUEBG  = "#DBEAFE";
const BLUELITE= "#EFF6FF";
const GRAY1   = "#212529";
const GRAY2   = "#495057";
const GRAY3   = "#6C757D";
const GRAY4   = "#ADB5BD";
const GRAY5   = "#DEE2E6";
const GRAYBG  = "#F8F9FA";
const DISABLEDL = "#E9ECEF";
const WHITE   = "#FFFFFF";

// ── Document-level styles (structure) ────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 15,
    paddingBottom: 24,
    paddingHorizontal: 15,
    color: GRAY1,
  },
  headerBand: {
    backgroundColor: MAROON,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerTitle: { fontFamily: "Helvetica-Bold", fontSize: 13, color: WHITE, marginBottom: 4 },
  headerSub:   { fontSize: 9, color: "#FFFFFF99" },
  infoRow:     { flexDirection: "row", marginBottom: 3 },
  infoLabel:   { fontFamily: "Helvetica-Bold", width: 60, color: GRAY2 },
  infoValue:   { flex: 1, color: GRAY2 },
  divider:     { borderBottomWidth: 0.5, borderBottomColor: GRAY5, marginTop: 6, marginBottom: 10 },
  // Module
  moduleBand:  { backgroundColor: GRAYBG, borderRadius: 3, flexDirection: "row", alignItems: "stretch", marginBottom: 6, marginTop: 4 },
  moduleAccent:{ width: 3, backgroundColor: MAROON, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
  moduleText:  { fontFamily: "Helvetica-Bold", fontSize: 10, color: MAROON, paddingVertical: 6, paddingHorizontal: 6, flex: 1 },
  // Section
  sectionLabel:{ fontFamily: "Helvetica-Bold", fontSize: 9, color: GRAY2, marginBottom: 2, marginLeft: 4 },
  sectionInst: { fontFamily: "Helvetica-Oblique", fontSize: 8, color: GRAY3, marginBottom: 4, marginLeft: 4 },
  // Question
  qContainer:  { marginBottom: 6, marginLeft: 4 },
  qIndex:      { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: GRAY3 },
  qName:       { fontSize: 9, color: GRAY1, marginBottom: 3 },
  qInst:       { fontFamily: "Helvetica-Oblique", fontSize: 7.5, color: GRAY4, marginBottom: 3 },
  noAnswer:    { fontFamily: "Helvetica-Oblique", fontSize: 8, color: GRAY4, marginLeft: 10, marginBottom: 2 },
  qDivider:    { borderBottomWidth: 0.3, borderBottomColor: GRAY5, marginTop: 5, marginBottom: 4, marginLeft: 6 },
  // Answer area indent
  answerArea:  { marginLeft: 10 },
  // Repeat iteration header
  iterHeader:  { backgroundColor: GRAYBG, flexDirection: "row", alignItems: "stretch", marginBottom: 5, borderRadius: 2 },
  iterAccent:  { width: 2, backgroundColor: MAROON, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 },
  iterTitle:   { fontFamily: "Helvetica-Bold", fontSize: 8, color: MAROON, paddingVertical: 4, paddingHorizontal: 6 },
  // Totals
  totalsHead:  { backgroundColor: BLUEBG, paddingVertical: 4, paddingHorizontal: 6, marginTop: 6, borderRadius: 2 },
  totalsTitle: { fontFamily: "Helvetica-Bold", fontSize: 8, color: BLUE },
  totalRow:    { backgroundColor: BLUELITE, flexDirection: "row", paddingVertical: 3, paddingHorizontal: 6, borderBottomWidth: 0.2, borderBottomColor: "#BFDBFE" },
  totalLabel:  { fontFamily: "Helvetica-Bold", fontSize: 8, color: BLUE, flex: 1 },
  totalValue:  { fontFamily: "Helvetica-Bold", fontSize: 8, color: BLUE },
  // Footer
  footer:      { position: "absolute", bottom: 8, left: 15, right: 15, flexDirection: "row", justifyContent: "space-between" },
  footerText:  { fontSize: 7, color: GRAY4 },
});

// ── Form.io-style field styles ────────────────────────────────────────────────
// Mimics Bootstrap form-control (disabled) look used by Form.io
const F = StyleSheet.create({
  // Generic field wrapper
  field:       { marginBottom: 7 },
  // Label above the input (like form-label in Bootstrap)
  label:       { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: GRAY1, marginBottom: 2 },
  // Input box (disabled / read-only appearance)
  inputBox:    { borderWidth: 0.8, borderColor: GRAY5, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: DISABLEDL },
  inputText:   { fontSize: 8.5, color: GRAY2 },
  emptyText:   { fontSize: 8.5, color: GRAY4, fontFamily: "Helvetica-Oblique" },
  // Checkbox / selectboxes
  checkRow:    { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 2 },
  checkbox:    { width: 11, height: 11, borderWidth: 0.8, borderColor: GRAY5, borderRadius: 2, alignItems: "center", justifyContent: "center", backgroundColor: WHITE },
  chkChecked:  { backgroundColor: MAROON, borderColor: MAROON },
  chkMark:     { fontSize: 7, color: WHITE },
  chkLabel:    { fontSize: 8.5, color: GRAY2 },
  // Radio
  radio:       { width: 10, height: 10, borderWidth: 0.8, borderColor: GRAY5, borderRadius: 5, alignItems: "center", justifyContent: "center", backgroundColor: WHITE },
  radioFill:   { width: 5, height: 5, borderRadius: 3, backgroundColor: MAROON },
  // Panel / fieldset
  panelBox:    { borderWidth: 0.5, borderColor: GRAY5, borderRadius: 3, marginBottom: 8 },
  panelHead:   { backgroundColor: GRAYBG, paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: GRAY5, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  panelTitle:  { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: MAROON },
  panelBody:   { paddingHorizontal: 8, paddingVertical: 6 },
  // Datagrid / editgrid table
  gridWrap:    { marginBottom: 8 },
  gridLabel:   { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: GRAY1, marginBottom: 3 },
  gridHead:    { flexDirection: "row", backgroundColor: MAROON },
  gridRowEven: { flexDirection: "row", backgroundColor: WHITE },
  gridRowOdd:  { flexDirection: "row", backgroundColor: GRAYBG },
  gridCell:    { flex: 1, fontSize: 7.5, paddingHorizontal: 5, paddingVertical: 4, borderRightWidth: 0.3, borderRightColor: GRAY5, borderBottomWidth: 0.3, borderBottomColor: GRAY5 },
  gridHCell:   { color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  gridBCell:   { color: GRAY2 },
  emptyGrid:   { fontFamily: "Helvetica-Oblique", fontSize: 8, color: GRAY4, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: DISABLEDL, borderWidth: 0.8, borderColor: GRAY5, borderRadius: 3 },
  // Columns layout gap
  colsGap:     { flexDirection: "row", gap: 8, marginBottom: 4 },
  // Tabs section title
  tabTitle:    { fontFamily: "Helvetica-Bold", fontSize: 8, color: MAROON, borderBottomWidth: 0.5, borderBottomColor: GRAY5, paddingBottom: 3, marginBottom: 5, marginTop: 4 },
  // Raw text fallback
  rawText:     { fontSize: 8.5, color: GRAY2, paddingVertical: 4 },
});

// ── Schema & value helpers ────────────────────────────────────────────────────

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

// ── Form.io component renderers ───────────────────────────────────────────────

function SimpleField({ comp, submission }: { comp: any; submission: any }) {
  const raw = submission?.[comp.key];
  const val = formatFieldValue(comp, raw);
  return (
    <View style={F.field} wrap={false}>
      <Text style={F.label}>{comp.label || comp.key}</Text>
      <View style={F.inputBox}>
        {val
          ? <Text style={F.inputText}>{val}</Text>
          : <Text style={F.emptyText}>—</Text>
        }
      </View>
    </View>
  );
}

function CheckboxField({ comp, submission }: { comp: any; submission: any }) {
  const checked = !!submission?.[comp.key];
  return (
    <View style={[F.field, F.checkRow]} wrap={false}>
      <View style={[F.checkbox, checked ? F.chkChecked : undefined]}>
        {checked && <Text style={F.chkMark}>✓</Text>}
      </View>
      <Text style={F.chkLabel}>{comp.label || comp.key}</Text>
    </View>
  );
}

function SelectboxesField({ comp, submission }: { comp: any; submission: any }) {
  const raw   = submission?.[comp.key] ?? {};
  const vals: { value: string; label: string }[] = comp.data?.values ?? comp.values ?? [];
  return (
    <View style={F.field}>
      <Text style={F.label}>{comp.label || comp.key}</Text>
      {vals.map((opt) => {
        const checked = !!(raw[opt.value]);
        return (
          <View key={opt.value} style={F.checkRow} wrap={false}>
            <View style={[F.checkbox, checked ? F.chkChecked : undefined]}>
              {checked && <Text style={F.chkMark}>✓</Text>}
            </View>
            <Text style={F.chkLabel}>{opt.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function RadioField({ comp, submission }: { comp: any; submission: any }) {
  const selected = submission?.[comp.key];
  const vals: { value: string; label: string }[] = comp.data?.values ?? comp.values ?? [];
  return (
    <View style={F.field}>
      <Text style={F.label}>{comp.label || comp.key}</Text>
      {vals.map((opt) => {
        const active = String(opt.value) === String(selected);
        return (
          <View key={opt.value} style={F.checkRow} wrap={false}>
            <View style={F.radio}>
              {active && <View style={F.radioFill} />}
            </View>
            <Text style={F.chkLabel}>{opt.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function DatagridField({ comp, submission }: { comp: any; submission: any }) {
  const rows: any[] = submission?.[comp.key] ?? [];
  const cols = extractLeafComponents(comp.components ?? []);
  return (
    <View style={F.gridWrap}>
      <Text style={F.gridLabel}>{comp.label || comp.key}</Text>
      {cols.length === 0 || rows.length === 0 ? (
        <Text style={F.emptyGrid}>Sin registros</Text>
      ) : (
        <View>
          <View style={F.gridHead} wrap={false}>
            {cols.map((c) => <Text key={c.key} style={[F.gridCell, F.gridHCell]}>{c.label}</Text>)}
          </View>
          {rows.map((row, ri) => (
            <View key={ri} style={ri % 2 === 0 ? F.gridRowEven : F.gridRowOdd} wrap={false}>
              {cols.map((c) => (
                <Text key={c.key} style={[F.gridCell, F.gridBCell]}>
                  {formatFieldValue(c, row?.[c.key]) || "—"}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Recursive renderer — handles all Form.io component types
function renderFormComponents(components: any[], submission: any): React.ReactElement[] {
  if (!Array.isArray(components)) return [];
  const out: React.ReactElement[] = [];
  let idx = 0;

  for (const comp of components) {
    if (!comp) continue;
    if (SKIP.has(comp.type)) continue;
    const k = comp.key || `c${idx++}`;

    // ── Layout containers ─────────────────────────────────────────────────
    if (comp.type === "panel" || comp.type === "well") {
      out.push(
        <View key={k} style={F.panelBox}>
          {comp.title && (
            <View style={F.panelHead}>
              <Text style={F.panelTitle}>{comp.title}</Text>
            </View>
          )}
          <View style={F.panelBody}>
            {renderFormComponents(comp.components ?? [], submission)}
          </View>
        </View>,
      );
      continue;
    }

    if (comp.type === "fieldset") {
      out.push(
        <View key={k} style={F.panelBox}>
          {comp.legend && (
            <View style={F.panelHead}>
              <Text style={F.panelTitle}>{comp.legend}</Text>
            </View>
          )}
          <View style={F.panelBody}>
            {renderFormComponents(comp.components ?? [], submission)}
          </View>
        </View>,
      );
      continue;
    }

    if (comp.type === "columns") {
      out.push(
        <View key={k} style={F.colsGap}>
          {(comp.columns ?? []).map((col: any, ci: number) => (
            <View key={ci} style={{ flex: col.width ?? 6 }}>
              {renderFormComponents(col.components ?? [], submission)}
            </View>
          ))}
        </View>,
      );
      continue;
    }

    if (comp.type === "table") {
      out.push(
        <View key={k} style={{ marginBottom: 8 }}>
          {(comp.rows ?? []).map((row: any[], ri: number) => (
            <View key={ri} style={{ flexDirection: "row" }}>
              {row.map((cell: any, ci: number) => (
                <View key={ci} style={{ flex: 1, padding: 4, borderWidth: 0.3, borderColor: GRAY5 }}>
                  {renderFormComponents(cell.components ?? [], submission)}
                </View>
              ))}
            </View>
          ))}
        </View>,
      );
      continue;
    }

    if (comp.type === "tabs") {
      const tabs: any[] = comp.components ?? [];
      out.push(
        <View key={k}>
          {tabs.map((tab) => (
            <View key={tab.key || tab.label}>
              <Text style={F.tabTitle}>{tab.label || tab.key}</Text>
              {renderFormComponents(tab.components ?? [], submission)}
            </View>
          ))}
        </View>,
      );
      continue;
    }

    if (comp.type === "container") {
      const nested = submission?.[comp.key] ?? submission;
      out.push(
        <View key={k}>
          {renderFormComponents(comp.components ?? [], nested)}
        </View>,
      );
      continue;
    }

    // ── Data tables ───────────────────────────────────────────────────────
    if (comp.type === "datagrid" || comp.type === "editgrid") {
      out.push(<DatagridField key={k} comp={comp} submission={submission} />);
      continue;
    }

    // ── Leaf fields ───────────────────────────────────────────────────────
    if (comp.input === true && comp.key) {
      if (comp.type === "checkbox") {
        out.push(<CheckboxField key={k} comp={comp} submission={submission} />);
      } else if (comp.type === "selectboxes") {
        out.push(<SelectboxesField key={k} comp={comp} submission={submission} />);
      } else if (comp.type === "radio") {
        out.push(<RadioField key={k} comp={comp} submission={submission} />);
      } else {
        out.push(<SimpleField key={k} comp={comp} submission={submission} />);
      }
      continue;
    }

    // ── Generic container fallback ────────────────────────────────────────
    if (Array.isArray(comp.components)) {
      out.push(
        <View key={k}>
          {renderFormComponents(comp.components, submission)}
        </View>,
      );
    }
  }

  return out;
}

// ── Submission builder ────────────────────────────────────────────────────────

type OpConfig = { label: string; expression: string };

interface ParsedSubmissions {
  components: any[];
  submissions: any[];
  operations: OpConfig[];
  isRepeat: boolean;
}

function buildSubmissions(question: QuestionItem): ParsedSubmissions | null {
  const raw = (question as any).question_structure ?? null;
  if (!raw) return null;
  try {
    const schema: any = typeof raw === "string" ? JSON.parse(raw) : { ...raw };
    const components = schema.components ?? [];
    const rc = schema.repeat_config;

    let rawSubs: any[];
    try {
      const parsed = JSON.parse(question.answer?.answer ?? "{}");
      rawSubs = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      rawSubs = [{}];
    }

    let submissions: any[];
    if (rc?.repeat && rc.data_repeat_type === "array" && Array.isArray(rc.data_repeat_config)) {
      submissions = rc.data_repeat_config.map((item: any, i: number) => ({
        ...item,
        ...(rawSubs[i] ?? {}),
      }));
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
    const values = p.cond && p.variable ? filterByCond(submissions, p.variable, p.cond) : p.variable ? extractNums(submissions, p.variable) : [];
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

// ── Question block ────────────────────────────────────────────────────────────

function QuestionBlock({ question }: { question: QuestionItem }) {
  let answerContent: React.ReactElement;

  if (!question.answer) {
    answerContent = <Text style={S.noAnswer}>Sin respuesta</Text>;
  } else {
    const parsed = buildSubmissions(question);

    if (!parsed) {
      // No schema → show raw answer text
      answerContent = (
        <View style={S.answerArea} wrap={false}>
          <Text style={F.rawText}>{question.answer.answer}</Text>
        </View>
      );
    } else if (!parsed.isRepeat) {
      // Single submission
      answerContent = (
        <View style={S.answerArea}>
          {renderFormComponents(parsed.components, parsed.submissions[0])}
        </View>
      );
    } else {
      // Repeat submissions
      const leafComps = extractLeafComponents(parsed.components);
      const opResults = evaluateOperations(parsed.operations, parsed.submissions);

      answerContent = (
        <View style={S.answerArea}>
          {parsed.submissions.map((sub, i) => {
            const titleField = leafComps.find(
              (c) => sub[c.key] && typeof sub[c.key] === "string" && /nombre|name|instituci|entidad|unidad|organismo/i.test(c.label),
            );
            const iterTitle = titleField?.key && sub[titleField.key]
              ? `Registro ${i + 1} — ${sub[titleField.key]}`
              : `Registro ${i + 1}`;

            return (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={S.iterHeader} wrap={false}>
                  <View style={S.iterAccent} />
                  <Text style={S.iterTitle}>{iterTitle}</Text>
                </View>
                {renderFormComponents(parsed.components, sub)}
              </View>
            );
          })}

          {opResults.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <View style={S.totalsHead} wrap={false}>
                <Text style={S.totalsTitle}>Totales generales</Text>
              </View>
              {opResults.map((r, i) => (
                <View key={i} style={S.totalRow} wrap={false}>
                  <Text style={S.totalLabel}>{r.label}:</Text>
                  <Text style={S.totalValue}>{r.result}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }
  }

  return (
    <View style={S.qContainer}>
      <Text style={S.qIndex}>{question.index}</Text>
      <Text style={S.qName}>{question.name}</Text>
      {question.instructions && <Text style={S.qInst}>{question.instructions}</Text>}
      {answerContent}
      <View style={S.qDivider} />
    </View>
  );
}

// ── PDF document ──────────────────────────────────────────────────────────────

function AnswersDocument({ data }: { data: GetAnswersResponse }) {
  const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

  const infoRows: [string, string][] = [
    ["Institución", data.institution.name],
    ["Usuario",     `${data.user.name} ${data.user.lastname}`],
    ["Correo",      data.user.email],
    ["Período",     `${data.census.init_date} — ${data.census.deadline}`],
    ["Generado",    today],
  ];

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Fixed header — repeats every page */}
        <View style={S.headerBand} fixed>
          <Text style={S.headerTitle}>REPORTE DE RESPUESTAS DE CENSO</Text>
          <Text style={S.headerSub}>{data.census.name}</Text>
        </View>

        {/* Info block */}
        {infoRows.map(([label, value]) => (
          <View key={label} style={S.infoRow}>
            <Text style={S.infoLabel}>{label}:</Text>
            <Text style={S.infoValue}>{value}</Text>
          </View>
        ))}
        <View style={S.divider} />

        {/* Content */}
        {data.modules.map((mod) => (
          <View key={mod.id}>
            <View style={S.moduleBand}>
              <View style={S.moduleAccent} />
              <Text style={S.moduleText}>Módulo {mod.index}: {mod.name}</Text>
            </View>

            {mod.sections.map((sec) => (
              <View key={sec.id} style={{ marginBottom: 6 }}>
                <Text style={S.sectionLabel}>Sección {sec.index}: {sec.name}</Text>
                {sec.instructions && <Text style={S.sectionInst}>{sec.instructions}</Text>}
                {sec.questions.map((q) => <QuestionBlock key={q.id} question={q} />)}
              </View>
            ))}
          </View>
        ))}

        {/* Fixed footer — repeats every page */}
        <View
          style={S.footer}
          fixed
          render={({ pageNumber, totalPages }) => (
            <>
              <Text style={S.footerText}>{data.census.name} · {data.institution.name}</Text>
              <Text style={S.footerText}>Pág. {pageNumber} / {totalPages}</Text>
            </>
          )}
        />
      </Page>
    </Document>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export async function generateAnswersPdf(data: GetAnswersResponse): Promise<void> {
  const blob = await pdf(<AnswersDocument data={data} />).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const safe = (s: string) => s.replace(/\s+/g, "_").replace(/[^\w]/g, "");
  a.href     = url;
  a.download = `respuestas_${safe(data.user.lastname)}_${safe(data.user.name)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
