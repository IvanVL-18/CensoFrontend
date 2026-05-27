import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { createElement, StrictMode } from "react";
import { Form } from "@formio/react";
import type { GetAnswersResponse, QuestionItem } from "./AdminAnswers.types";

// ── Layout constants ─────────────────────────────────────────────
const MARGIN = 15;
const PAGE_H = 297;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BR = 122, BG = 12, BB = 46; // #7A0C2E

// ── Form.io schema parsing helpers ──────────────────────────────

type FlatComp = {
  key: string;
  label: string;
  type: string;
  values: { label: string; value: string }[];
};

function extractLeafComponents(components: any[]): FlatComp[] {
  if (!Array.isArray(components)) return [];
  const result: FlatComp[] = [];
  const SKIP = new Set(["button", "htmlelement", "content", "file", "signature"]);
  for (const comp of components) {
    if (!comp) continue;
    if (comp.input === true && comp.key && !SKIP.has(comp.type)) {
      result.push({
        key: comp.key,
        label: comp.label || comp.key,
        type: comp.type,
        values: comp.data?.values ?? comp.values ?? [],
      });
    }
    if (Array.isArray(comp.components))
      result.push(...extractLeafComponents(comp.components));
    if (Array.isArray(comp.columns))
      for (const col of comp.columns)
        result.push(...extractLeafComponents(col.components ?? []));
    if (Array.isArray(comp.rows))
      for (const row of comp.rows)
        if (Array.isArray(row))
          for (const cell of row)
            result.push(...extractLeafComponents(cell.components ?? []));
  }
  return result;
}

function sanitizeComponents(components: any[]): any[] {
  return components.map((comp) => {
    const s = { ...comp };
    if (s.inputMask === null) s.inputMask = "";
    if (s.displayMask === null) s.displayMask = "";
    if (Array.isArray(s.components)) s.components = sanitizeComponents(s.components);
    if (Array.isArray(s.columns))
      s.columns = s.columns.map((col: any) => ({
        ...col,
        components: sanitizeComponents(col.components ?? []),
      }));
    if (Array.isArray(s.rows))
      s.rows = s.rows.map((row: any[]) =>
        Array.isArray(row)
          ? row.map((cell: any) => ({
              ...cell,
              components: sanitizeComponents(cell.components ?? []),
            }))
          : row,
      );
    return s;
  });
}

function disableAllFields(components: any[]): any[] {
  if (!Array.isArray(components)) return [];
  return components.map((comp: any) => {
    const c = { ...comp, disabled: true };
    if (Array.isArray(c.components)) c.components = disableAllFields(c.components);
    if (Array.isArray(c.columns))
      c.columns = c.columns.map((col: any) => ({
        ...col,
        components: disableAllFields(col.components ?? []),
      }));
    if (Array.isArray(c.rows))
      c.rows = c.rows.map((row: any) =>
        Array.isArray(row)
          ? row.map((cell: any) => ({
              ...cell,
              components: disableAllFields(cell.components ?? []),
            }))
          : row,
      );
    return c;
  });
}

// ── Math operations engine (mirrors AnswerModal / AdminAnswerModal) ──

type OpConfig = { label: string; expression: string };

function parseExpression(expression: string) {
  const match = expression.match(/(\w+)\(([^,]*)(?:,\s*([^)]+))?\)/);
  if (!match) return null;
  return { operation: match[1].toUpperCase(), variable: match[2]?.trim() || null, condition: match[3]?.trim() || null };
}

function extractNumbers(dataArray: any[], variable: string): number[] {
  return dataArray
    .map((e) => e?.[variable])
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map(Number)
    .filter((v) => !isNaN(v));
}

function evalCondition(record: any, condition: string): boolean {
  try {
    const keys = Object.keys(record);
    // eslint-disable-next-line no-new-func
    return new Function(...keys, `return ${condition};`)(...keys.map((k) => record[k]));
  } catch { return false; }
}

function filterByCondition(dataArray: any[], variable: string, condition: string): number[] {
  return dataArray
    .filter((r) => evalCondition(r, condition))
    .map((r) => r?.[variable])
    .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(Number);
}

function evaluateOperations(operations: OpConfig[], submissions: any[]): { label: string; result: string }[] {
  if (!operations?.length || !submissions?.length) return [];
  return operations.map(({ label, expression }) => {
    const parsed = parseExpression(expression);
    if (!parsed) return { label, result: "—" };
    const { operation, variable, condition } = parsed;
    const values = condition && variable
      ? filterByCondition(submissions, variable, condition)
      : variable ? extractNumbers(submissions, variable) : [];
    let result: number | string;
    switch (operation) {
      case "SUMAR": case "SUMARSI": result = values.reduce((a, b) => a + b, 0); break;
      case "CONTAR": case "CONTARSI": result = values.length; break;
      case "PROMEDIAR": case "PROMEDIARSI":
        result = values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0; break;
      case "MAX": case "MAXSI": result = values.length ? Math.max(...values) : 0; break;
      case "MIN": case "MINSI": result = values.length ? Math.min(...values) : 0; break;
      default: result = "N/D";
    }
    return { label, result: String(result) };
  });
}

// ── Submission builder (mirrors AnswerModal logic) ────────────────

interface ParsedSubmissions {
  schema: any;
  submissions: any[];
  operations: OpConfig[];
  isRepeat: boolean;
}

function buildSubmissions(question: QuestionItem): ParsedSubmissions | null {
  const rawStructure = (question as any).question_structure ?? null;
  if (!rawStructure) return null;

  try {
    let schema: any = typeof rawStructure === "string" ? JSON.parse(rawStructure) : { ...rawStructure };
    schema = { ...schema, display: "form", components: sanitizeComponents(schema.components ?? []) };
    schema = { ...schema, components: disableAllFields(schema.components) };

    const rc = schema.repeat_config;
    const answerStr = question.answer?.answer ?? null;

    let rawSubmissions: any[];
    try {
      const parsed = JSON.parse(answerStr ?? "{}");
      rawSubmissions = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      rawSubmissions = [{}];
    }

    let submissions: any[];
    if (rc?.repeat && rc.data_repeat_type === "array" && Array.isArray(rc.data_repeat_config)) {
      submissions = rc.data_repeat_config.map((item: any, i: number) => ({
        ...item,
        ...(rawSubmissions[i] ?? {}),
      }));
    } else {
      submissions = rawSubmissions;
    }

    const isRepeat = rc?.repeat === true && submissions.length > 1;
    return { schema, submissions, operations: schema.operations ?? [], isRepeat };
  } catch {
    return null;
  }
}

// ── html2canvas capture ──────────────────────────────────────────

/**
 * Renders a form.io Form component into a hidden off-screen div and
 * captures it with html2canvas, returning the canvas element.
 * Uses the same .bs Bootstrap-scoped wrapper the modals use.
 */
async function captureFormToCanvas(
  schema: any,
  submissionData: any,
): Promise<HTMLCanvasElement> {
  const RENDER_W = 1600;

  // Bootstrap's .table-responsive sets overflow-x:auto, so html2canvas only captures
  // the visible scroll area (cutting off columns to the right).
  // Temporarily override it to overflow:visible for the capture, then remove.
  const styleEl = document.createElement("style");
  styleEl.textContent = `.table-responsive { overflow: visible !important; }`;
  document.head.appendChild(styleEl);

  // position:absolute left:-9999px — browser paints absolute off-screen elements.
  // position:fixed off-screen is NOT painted (browser compositor optimization).
  const host = document.createElement("div");
  host.className = "bs";
  Object.assign(host.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: `${RENDER_W}px`,
    backgroundColor: "#ffffff",
    padding: "16px",
    overflow: "hidden", // overflow:hidden → scrollHeight = full content height
  });
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    createElement(StrictMode, null,
      createElement("div", { className: "bg-white p-4 rounded border border-gray-200" },
        createElement(Form as any, {
          form: schema,
          submission: { data: submissionData },
          options: {
            noAlerts: true,
            language: "es",
            noDefaultSubmitButton: true,
            readOnly: true,
          },
        }),
      ),
    ),
  );

  await new Promise((r) => setTimeout(r, 700));

  // scrollWidth/scrollHeight correct with overflow:hidden
  const fullW = Math.max(host.scrollWidth, RENDER_W);
  const fullH = host.scrollHeight + 4;

  host.style.width = `${fullW}px`;
  host.style.height = `${fullH}px`;

  // One frame to let the browser reflow after dimension change
  await new Promise<void>((resolve) => { requestAnimationFrame(() => resolve()); });

  const canvas = await html2canvas(host, {
    scale: 0.8,  // 1600 * 0.8 = 1280px canvas — similar file size to before, wider layout
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: fullW,
    height: fullH,
    windowWidth: fullW,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
  });

  root.unmount();
  document.body.removeChild(host);
  document.head.removeChild(styleEl);
  return canvas;
}

// ── PDF helpers ──────────────────────────────────────────────────

function pageBreak(doc: jsPDF, y: number, needed = 10): number {
  if (y + needed > PAGE_H - MARGIN - 8) {
    doc.addPage();
    return MARGIN + 5;
  }
  return y;
}

/** Slices a canvas into pages and adds each slice to the PDF as a JPEG. */
function addCanvasToPdf(doc: jsPDF, canvas: HTMLCanvasElement, xMm: number, yMm: number, maxWidthMm: number): number {
  const pxPerMm = canvas.width / maxWidthMm;
  const totalHeightMm = canvas.height / pxPerMm;
  const bottomLimit = PAGE_H - MARGIN - 8;

  let srcYmm = 0;
  let y = yMm;

  while (srcYmm < totalHeightMm) {
    const spaceOnPage = bottomLimit - y;
    if (spaceOnPage < 5) {
      doc.addPage();
      y = MARGIN + 5;
      continue;
    }

    const sliceHmm = Math.min(totalHeightMm - srcYmm, spaceOnPage);
    const srcYpx = Math.round(srcYmm * pxPerMm);
    const sliceHpx = Math.round(sliceHmm * pxPerMm);

    // Draw only the slice into a temporary canvas
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = sliceHpx;
    const ctx = tmp.getContext("2d")!;
    ctx.drawImage(canvas, 0, -srcYpx);

    const dataUrl = tmp.toDataURL("image/jpeg", 0.82);
    doc.addImage(dataUrl, "JPEG", xMm, y, maxWidthMm, sliceHmm);

    srcYmm += sliceHmm;
    y += sliceHmm;

    if (srcYmm < totalHeightMm) {
      doc.addPage();
      y = MARGIN + 5;
    }
  }

  return y + 2;
}

// ── Totals section (text-based, fast) ────────────────────────────

function drawTotals(
  doc: jsPDF,
  results: { label: string; result: string }[],
  x: number,
  yIn: number,
  tableW: number,
): number {
  if (!results.length) return yIn;
  let y = pageBreak(doc, yIn, 12);

  // Blue header
  doc.setFillColor(219, 234, 254);
  doc.rect(x, y, tableW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text("Totales generales", x + 3, y + 4.8);
  y += 8;

  for (const r of results) {
    y = pageBreak(doc, y, 6);
    doc.setFillColor(239, 246, 255);
    doc.rect(x, y, tableW, 6, "F");
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.2);
    doc.line(x, y + 6, x + tableW, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    doc.text(`${r.label}:`, x + 3, y + 4.3);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(r.result, x + tableW - 3, y + 4.3, { align: "right" });
    y += 6;
  }
  return y + 3;
}

// ── Main export ──────────────────────────────────────────────────

export async function generateAnswersPdf(data: GetAnswersResponse): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(BR, BG, BB);
  doc.rect(MARGIN, y, CONTENT_W, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("REPORTE DE RESPUESTAS DE CENSO", MARGIN + 5, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const censusNameLines = doc.splitTextToSize(data.census.name, CONTENT_W - 10);
  doc.text(censusNameLines, MARGIN + 5, y + 17);
  y += 30;

  // ── Info block ───────────────────────────────────────────────
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

  const infoRows: [string, string][] = [
    ["Institución", data.institution.name],
    ["Usuario", `${data.user.name} ${data.user.lastname}`],
    ["Correo", data.user.email],
    ["Período", `${data.census.init_date} — ${data.census.deadline}`],
    ["Generado", today],
  ];

  for (const [label, value] of infoRows) {
    y = pageBreak(doc, y, 7);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    const vl = doc.splitTextToSize(value, CONTENT_W - 30);
    doc.text(vl, MARGIN + 28, y);
    y += vl.length * 5 + 1;
  }

  y += 4;
  doc.setDrawColor(210, 210, 210);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 7;

  // ── Modules ──────────────────────────────────────────────────
  for (const module of data.modules) {
    y = pageBreak(doc, y, 18);

    // Module band
    doc.setFillColor(245, 245, 248);
    doc.rect(MARGIN, y, CONTENT_W, 10, "F");
    doc.setFillColor(BR, BG, BB);
    doc.rect(MARGIN, y, 3, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(BR, BG, BB);
    const modLines = doc.splitTextToSize(`Módulo ${module.index}: ${module.name}`, CONTENT_W - 8);
    doc.text(modLines, MARGIN + 6, y + 7);
    y += modLines.length * 6 + 5;

    for (const section of module.sections) {
      y = pageBreak(doc, y, 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const secLines = doc.splitTextToSize(`Sección ${section.index}: ${section.name}`, CONTENT_W - 5);
      doc.text(secLines, MARGIN + 4, y);
      y += secLines.length * 5 + 2;

      if (section.instructions) {
        y = pageBreak(doc, y, 7);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        const il = doc.splitTextToSize(section.instructions, CONTENT_W - 8);
        doc.text(il, MARGIN + 4, y);
        y += il.length * 4.5 + 2;
      }

      y += 1;

      for (const question of section.questions) {
        y = pageBreak(doc, y, 14);

        // Question index + name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.text(question.index, MARGIN + 6, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        const qLines = doc.splitTextToSize(question.name, CONTENT_W - 22);
        doc.text(qLines, MARGIN + 16, y);
        y += qLines.length * 4.8 + 1;

        if (question.instructions) {
          y = pageBreak(doc, y, 6);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(160, 160, 160);
          const instrLines = doc.splitTextToSize(question.instructions, CONTENT_W - 22);
          doc.text(instrLines, MARGIN + 16, y);
          y += instrLines.length * 4 + 1;
        }

        // ── Answer section ─────────────────────────────────────
        if (!question.answer) {
          y = pageBreak(doc, y, 6);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(190, 190, 190);
          doc.text("Sin respuesta", MARGIN + 16, y);
          y += 5;
        } else {
          const parsed = buildSubmissions(question);

          if (!parsed) {
            // No schema — show raw text
            y = pageBreak(doc, y, 6);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(30, 30, 30);
            const al = doc.splitTextToSize(question.answer.answer, CONTENT_W - 22);
            doc.text(al, MARGIN + 16, y);
            y += al.length * 4.8 + 2;
          } else {
            const answerX = MARGIN + 16;
            const answerW = CONTENT_W - 16; // mm

            if (!parsed.isRepeat) {
              // ── Single form: one canvas ─────────────────────
              try {
                const canvas = await captureFormToCanvas(parsed.schema, parsed.submissions[0]);
                y = pageBreak(doc, y, 10);
                y = addCanvasToPdf(doc, canvas, answerX, y, answerW);
              } catch {
                y = pageBreak(doc, y, 6);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(30, 30, 30);
                const al = doc.splitTextToSize(question.answer.answer, CONTENT_W - 22);
                doc.text(al, MARGIN + 16, y);
                y += al.length * 4.8 + 2;
              }
            } else {
              // ── Repeat form: one canvas per iteration ────────
              const leafComps = extractLeafComponents(parsed.schema.components ?? []);
              for (let i = 0; i < parsed.submissions.length; i++) {
                const sub = parsed.submissions[i];

                // If less than 65mm remain, start on a fresh page to avoid
                // "Text Field header only" at the bottom of a page
                if (PAGE_H - MARGIN - 8 - y < 65) {
                  doc.addPage();
                  y = MARGIN + 5;
                }

                // Iteration header
                y = pageBreak(doc, y, 10);
                doc.setFillColor(245, 245, 248);
                doc.rect(answerX, y, answerW, 7, "F");
                doc.setFillColor(BR, BG, BB);
                doc.rect(answerX, y, 2, 7, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(BR, BG, BB);

                // Try to find an identifying label in the data
                const titleField = leafComps.find(
                  (c) =>
                    sub[c.key] &&
                    typeof sub[c.key] === "string" &&
                    /nombre|name|instituci|entidad|unidad|organismo/i.test(c.label),
                );
                const iterTitle = titleField?.key && sub[titleField.key]
                  ? `Registro ${i + 1} — ${sub[titleField.key]}`
                  : `Registro ${i + 1}`;
                doc.text(iterTitle, answerX + 5, y + 4.8);
                y += 9;

                try {
                  const canvas = await captureFormToCanvas(parsed.schema, sub);
                  y = addCanvasToPdf(doc, canvas, answerX, y, answerW);
                } catch {
                  // Fallback: skip this iteration silently
                  y += 2;
                }
              }

              // Totals
              const opResults = evaluateOperations(parsed.operations, parsed.submissions);
              if (opResults.length) {
                y = drawTotals(doc, opResults, answerX, y, answerW);
              }
            }
          }
        }

        // Thin divider between questions
        doc.setDrawColor(235, 235, 235);
        doc.line(MARGIN + 6, y, MARGIN + CONTENT_W, y);
        y += 4;
      }

      y += 3;
    }

    y += 4;
  }

  // ── Page footers ─────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(190, 190, 190);
    const fy = PAGE_H - 7;
    doc.text(`${data.census.name} · ${data.institution.name}`, MARGIN, fy);
    doc.text(`Pág. ${i} / ${totalPages}`, PAGE_W - MARGIN, fy, { align: "right" });
  }

  const safe = (s: string) => s.replace(/\s+/g, "_").replace(/[^\w]/g, "");
  doc.save(`respuestas_${safe(data.user.lastname)}_${safe(data.user.name)}.pdf`);
}
