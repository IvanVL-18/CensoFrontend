import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type {
  GetAnswersResponse,
  ModuleItem,
  QuestionItem,
  SectionItem,
} from "./AdminAnswers.types";
import { evaluateOperations } from "../../lib/formioOperations";
import { htmlToText, shouldShowLabel } from "../../lib/formioText";

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
  qName:       { fontSize: 9, color: GRAY1, marginBottom: 4, lineHeight: 1.35 },
  qIndexInline:{ fontFamily: "Helvetica-Bold", fontSize: 9, color: MAROON },
  qInst:       { fontFamily: "Helvetica-Oblique", fontSize: 7.5, color: GRAY4, marginBottom: 3 },
  noAnswer:    { fontFamily: "Helvetica-Oblique", fontSize: 8, color: GRAY4, marginLeft: 10, marginBottom: 2 },
  qDivider:    { borderBottomWidth: 0.3, borderBottomColor: GRAY5, marginTop: 5, marginBottom: 4, marginLeft: 6 },
  // Answer area indent (borde guía a la izquierda)
  answerArea:  { marginLeft: 6, paddingLeft: 8, borderLeftWidth: 0.6, borderLeftColor: GRAY5 },
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
  // Columns layout gap (alineadas por la base, igual que en la web)
  colsGap:     { flexDirection: "row", gap: 8, marginBottom: 4, alignItems: "flex-end" },
  // content / htmlelement
  contentHeading: { fontFamily: "Helvetica-Bold", fontSize: 8, color: GRAY2, textAlign: "center", marginTop: 3, marginBottom: 3 },
  contentText:    { fontSize: 7.5, color: GRAY3, marginBottom: 4, lineHeight: 1.4 },
  // Tabs section title
  tabTitle:    { fontFamily: "Helvetica-Bold", fontSize: 8, color: MAROON, borderBottomWidth: 0.5, borderBottomColor: GRAY5, paddingBottom: 3, marginBottom: 5, marginTop: 4 },
  // Raw text fallback
  rawText:     { fontSize: 8.5, color: GRAY2, paddingVertical: 4 },
});

// ── Schema & value helpers ────────────────────────────────────────────────────

// content/htmlelement NO se saltan: ahí viven los encabezados reales de las
// preguntas ("Total", "Hombres", "Subtotal"...) — se renderizan como texto.
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
      {shouldShowLabel(comp) && <Text style={F.label}>{comp.label}</Text>}
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
      <View style={checked ? [F.checkbox, F.chkChecked] : F.checkbox}>
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
      {shouldShowLabel(comp) && <Text style={F.label}>{comp.label}</Text>}
      {vals.map((opt) => {
        const checked = !!(raw[opt.value]);
        return (
          <View key={opt.value} style={F.checkRow} wrap={false}>
            <View style={checked ? [F.checkbox, F.chkChecked] : F.checkbox}>
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
      {shouldShowLabel(comp) && <Text style={F.label}>{comp.label}</Text>}
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
      {shouldShowLabel(comp) && <Text style={F.gridLabel}>{comp.label}</Text>}
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
    if (comp.hidden === true) continue;
    const k = comp.key || `c${idx++}`;

    // ── Contenido HTML (encabezados/instrucciones de las preguntas) ───────
    if (comp.type === "content" || comp.type === "htmlelement") {
      const text = htmlToText(comp.html ?? comp.content ?? "");
      if (!text) continue;
      // Texto corto de una línea → encabezado centrado (títulos tipo
      // "Total", "Hombres", "Pertenecen a pueblo indígena"); largo → párrafo
      const isHeading = text.length <= 110 && !text.includes("\n");
      out.push(
        <Text key={k} style={isHeading ? F.contentHeading : F.contentText}>
          {text}
        </Text>,
      );
      continue;
    }

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
// Motor compartido en src/lib/formioOperations.ts (mismo que usan los modales)

function evaluateOperationsForPdf(
  ops: OpConfig[],
  submissions: any[]
): { label: string; result: string }[] {
  return evaluateOperations(ops, submissions).map((r) => ({
    label: r.label,
    result: String(r.result),
  }));
}

// ── Question block ────────────────────────────────────────────────────────────

function TotalsBlock({ results }: { results: { label: string; result: string }[] }) {
  if (!results.length) return null;
  return (
    <View style={{ marginTop: 4 }}>
      <View style={S.totalsHead} wrap={false}>
        <Text style={S.totalsTitle}>Totales generales</Text>
      </View>
      {results.map((r, i) => (
        <View key={i} style={S.totalRow} wrap={false}>
          <Text style={S.totalLabel}>{r.label}:</Text>
          <Text style={S.totalValue}>{r.result}</Text>
        </View>
      ))}
    </View>
  );
}

/** Título de cada iteración repeat: campo "nombre/unidad" o label del repeat_config. */
function iterationTitle(
  sub: any,
  index: number,
  leafComps: FlatComp[]
): string {
  const titleField = leafComps.find(
    (c) =>
      sub[c.key] &&
      typeof sub[c.key] === "string" &&
      /nombre|name|instituci|entidad|unidad|organismo/i.test(c.label),
  );
  const fromField = titleField?.key ? sub[titleField.key] : null;
  // data_repeat_config suele traer un label/nombre por unidad
  const fromConfig = [sub.label, sub.nombre, sub.name, sub.unidad].find(
    (v) => typeof v === "string" && v.trim() !== ""
  );
  const title = fromField || fromConfig;
  return title ? `Registro ${index + 1} — ${title}` : `Registro ${index + 1}`;
}

function QuestionBlock({ fragment }: { fragment: QuestionFragment }) {
  const { question, parsed, from, to, first, last } = fragment;
  let answerContent: React.ReactElement;

  if (!question.answer) {
    answerContent = <Text style={S.noAnswer}>Sin respuesta</Text>;
  } else {
    if (!parsed) {
      // No schema → show raw answer text
      answerContent = (
        <View style={S.answerArea} wrap={false}>
          <Text style={F.rawText}>{question.answer.answer}</Text>
        </View>
      );
    } else {
      // Los totales se calculan siempre sobre TODOS los registros, aunque el
      // bloque venga partido en varias páginas; solo se imprimen en la última.
      const opResults = last
        ? evaluateOperationsForPdf(parsed.operations, parsed.submissions)
        : [];

      if (!parsed.isRepeat) {
        // Single submission (con totales si la pregunta define operaciones)
        answerContent = (
          <View style={S.answerArea}>
            {renderFormComponents(parsed.components, parsed.submissions[0])}
            <TotalsBlock results={opResults} />
          </View>
        );
      } else {
        // Repeat submissions — solo el tramo [from, to) de esta página
        const leafComps = extractLeafComponents(parsed.components);

        answerContent = (
          <View style={S.answerArea}>
            {parsed.submissions.slice(from, to).map((sub, i) => (
              <View key={from + i} style={{ marginBottom: 6 }}>
                <View style={S.iterHeader} wrap={false}>
                  <View style={S.iterAccent} />
                  <Text style={S.iterTitle}>
                    {iterationTitle(sub, from + i, leafComps)}
                  </Text>
                </View>
                {renderFormComponents(parsed.components, sub)}
              </View>
            ))}
            <TotalsBlock results={opResults} />
          </View>
        );
      }
    }
  }

  const total = parsed?.isRepeat ? parsed.submissions.length : 0;

  return (
    <View style={S.qContainer}>
      <Text style={S.qName}>
        {question.index ? <Text style={S.qIndexInline}>{question.index} · </Text> : null}
        {question.name}
        {total > 0 && !(first && last) ? (
          <Text style={S.qInst}>{`  (registros ${from + 1}–${to} de ${total})`}</Text>
        ) : null}
      </Text>
      {first && question.instructions && (
        <Text style={S.qInst}>{question.instructions}</Text>
      )}
      {answerContent}
      {last && <View style={S.qDivider} />}
    </View>
  );
}

// ── Paginado por presupuesto ──────────────────────────────────────────────────
// El costo de layout de @react-pdf es cuadrático respecto al contenido de UN
// mismo <Page>: los censos reales traen esquemas de cientos de componentes por
// pregunta y el documento completo dentro de una sola <Page> tarda decenas de
// minutos (medido: 37 preguntas → 38 min). Repartir el mismo contenido en
// varias <Page> lo vuelve lineal, así que agrupamos las preguntas en páginas
// hasta agotar un presupuesto de nodos estimados.

/** Nodos estimados que caben en una <Page> antes de que el layout se degrade. */
const PAGE_BUDGET = 400;

/**
 * Un tramo de pregunta que cabe en una página. Las preguntas con repeticiones
 * (hasta 120 registros × decenas de campos) se parten por registros; el resto
 * es un único fragmento con `first` y `last` en true.
 */
interface QuestionFragment {
  question: QuestionItem;
  parsed:   ParsedSubmissions | null;
  from:     number;  // primer registro incluido
  to:       number;  // exclusivo
  first:    boolean; // imprime instrucciones
  last:     boolean; // imprime totales y separador
  weight:   number;
}

/** Cuenta componentes del esquema (aprox. nodos que emitirá el renderer). */
function countComponents(components: any[]): number {
  if (!Array.isArray(components)) return 0;
  let n = 0;
  for (const c of components) {
    if (!c) continue;
    n++;
    if (Array.isArray(c.components)) n += countComponents(c.components);
    if (Array.isArray(c.columns))
      for (const col of c.columns) n += countComponents(col?.components ?? []);
    if (Array.isArray(c.rows))
      for (const row of c.rows)
        if (Array.isArray(row))
          for (const cell of row) n += countComponents(cell?.components ?? []);
  }
  return n;
}

/**
 * Parsea una vez por pregunta (los esquemas reales pesan ~1 MB) y la corta en
 * fragmentos que quepan en el presupuesto de página.
 */
function splitQuestion(question: QuestionItem): QuestionFragment[] {
  const parsed = question.answer ? buildSubmissions(question) : null;
  const whole  = (weight: number): QuestionFragment[] => [
    { question, parsed, from: 0, to: 1, first: true, last: true, weight },
  ];

  if (!parsed) return whole(1);

  const comps = Math.max(1, countComponents(parsed.components));
  if (!parsed.isRepeat) return whole(comps);

  const total = parsed.submissions.length;
  // Registros por página: al menos uno, aunque el formulario sea enorme.
  const perPage = Math.max(1, Math.floor(PAGE_BUDGET / comps));
  const out: QuestionFragment[] = [];
  for (let from = 0; from < total; from += perPage) {
    const to = Math.min(total, from + perPage);
    out.push({
      question,
      parsed,
      from,
      to,
      first: from === 0,
      last:  to === total,
      weight: comps * (to - from),
    });
  }
  return out.length ? out : whole(comps);
}

interface SectionChunk {
  module:       ModuleItem;
  section:      SectionItem;
  fragments:    QuestionFragment[];
  continuation: boolean; // la sección venía de la página anterior
}

/** Reparte los fragmentos en páginas respetando el presupuesto. */
function buildPages(data: GetAnswersResponse): SectionChunk[][] {
  const pages: SectionChunk[][] = [];
  let current: SectionChunk[] = [];
  let used = 0;

  const flush = () => {
    if (current.length) pages.push(current);
    current = [];
    used = 0;
  };

  for (const mod of data.modules) {
    for (const sec of mod.sections) {
      let continuation = false;
      for (const q of sec.questions) {
        for (const fragment of splitQuestion(q)) {
          // Si el fragmento no cabe y la página ya trae contenido, abre otra.
          if (used > 0 && used + fragment.weight > PAGE_BUDGET) {
            flush();
            continuation = true;
          }
          let chunk = current[current.length - 1];
          if (!chunk || chunk.section.id !== sec.id) {
            chunk = { module: mod, section: sec, fragments: [], continuation };
            current.push(chunk);
          }
          chunk.fragments.push(fragment);
          used += fragment.weight;
        }
      }
      if (used >= PAGE_BUDGET) flush();
    }
  }
  flush();
  return pages.length ? pages : [[]];
}

// ── PDF document ──────────────────────────────────────────────────────────────

function PageFrame({
  data,
  children,
}: {
  data: GetAnswersResponse;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={S.page}>
      {/* Fixed header — repeats every page */}
      <View style={S.headerBand} fixed>
        <Text style={S.headerTitle}>REPORTE DE RESPUESTAS DE CENSO</Text>
        <Text style={S.headerSub}>{data.census.name}</Text>
      </View>

      {children}

      {/* Fixed footer — repeats every page */}
      <View style={S.footer} fixed>
        <Text style={S.footerText}>{data.census.name} · {data.institution.name}</Text>
        <Text
          style={S.footerText}
          render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}`}
        />
      </View>
    </Page>
  );
}

function AnswersDocument({ data }: { data: GetAnswersResponse }) {
  const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

  const infoRows: [string, string][] = [
    ["Institución", data.institution.name],
    ["Usuario",     `${data.user.name} ${data.user.lastname}`],
    ["Correo",      data.user.email],
    ["Período",     `${data.census.init_date} — ${data.census.deadline}`],
    ["Generado",    today],
  ];

  const pages = buildPages(data);

  return (
    <Document>
      {pages.map((chunks, pi) => (
        <PageFrame key={pi} data={data}>
          {/* Ficha de identificación: solo en la primera página */}
          {pi === 0 && (
            <>
              {infoRows.map(([label, value]) => (
                <View key={label} style={S.infoRow}>
                  <Text style={S.infoLabel}>{label}:</Text>
                  <Text style={S.infoValue}>{value}</Text>
                </View>
              ))}
              <View style={S.divider} />
            </>
          )}

          {chunks.map((chunk, ci) => {
            const { module: mod, section: sec } = chunk;
            const prevChunk = ci > 0 ? chunks[ci - 1] : null;
            const showModule = !prevChunk || prevChunk.module.id !== mod.id;
            return (
              <View key={`${sec.id}-${ci}`} style={{ marginBottom: 6 }}>
                {showModule && (
                  <View style={S.moduleBand}>
                    <View style={S.moduleAccent} />
                    <Text style={S.moduleText}>
                      Módulo {mod.index}: {mod.name}
                    </Text>
                  </View>
                )}
                <Text style={S.sectionLabel}>
                  Sección {sec.index}: {sec.name}
                  {chunk.continuation && ci === 0 ? " (continúa)" : ""}
                </Text>
                {sec.instructions && !chunk.continuation && (
                  <Text style={S.sectionInst}>{sec.instructions}</Text>
                )}
                {chunk.fragments.map((fragment, fi) => (
                  <QuestionBlock
                    key={`${fragment.question.id}-${fragment.from}-${fi}`}
                    fragment={fragment}
                  />
                ))}
              </View>
            );
          })}
        </PageFrame>
      ))}
    </Document>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

/** Descarga un blob sin depender de que el ancla esté fuera del DOM. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revocar en el mismo tick puede cancelar la descarga en curso.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function generateAnswersPdf(data: GetAnswersResponse): Promise<void> {
  const blob = await pdf(<AnswersDocument data={data} />).toBlob();
  const safe = (s: string) => s.replace(/\s+/g, "_").replace(/[^\w]/g, "");
  downloadBlob(
    blob,
    `respuestas_${safe(data.user.lastname)}_${safe(data.user.name)}.pdf`,
  );
}
