import jsPDF from "jspdf";
import type { CensusModuleItem } from "../components/charts";

// ── brand colors ─────────────────────────────────────────────────────────────
const BURGUNDY: [number, number, number] = [124, 18, 39];
const DARK: [number, number, number] = [30, 30, 30];
const MID: [number, number, number] = [100, 75, 82];
const LIGHT_BG: [number, number, number] = [245, 241, 234];

// Misma paleta que chartUtils.js para que los colores coincidan con la gráfica
const PALETTE = [
  "#7C1227", "#9d7e43", "#4b7c8a", "#b3885b", "#3d7a5c",
  "#6b5b2e", "#c45c6a", "#8b6914", "#2d6b8a", "#a05c3a",
];

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

// ── asset helpers ─────────────────────────────────────────────────────────────

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function svgBlobToPng(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); URL.revokeObjectURL(url); return; }
      ctx.drawImage(img, 0, 0, 240, 96);
      resolve(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

async function loadAsBase64(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    const blob = await res.blob();
    if (contentType.includes("svg") || path.endsWith(".svg")) {
      return await svgBlobToPng(blob);
    }
    return await blobToDataURL(blob);
  } catch {
    return null;
  }
}

/**
 * Extrae el elemento <svg> de Recharts dentro del contenedor y lo convierte
 * a PNG vía XMLSerializer + canvas. Evita html2canvas y su incompatibilidad
 * con colores oklch() de Tailwind v4.
 */
async function extractChartSvgAsPng(
  containerEl: HTMLElement
): Promise<string | null> {
  const svgEl = containerEl.querySelector("svg");
  if (!svgEl) return null;

  const rect = svgEl.getBoundingClientRect();
  const W = rect.width > 0 ? rect.width : 320;
  const H = rect.height > 0 ? rect.height : 320;

  const serializer = new XMLSerializer();
  let svgStr = serializer.serializeToString(svgEl);

  // Asegurar namespace SVG
  if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgStr = svgStr.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Asegurar dimensiones explícitas para que el navegador lo renderice
  svgStr = svgStr.replace(/<svg([^>]*)>/, (_m, attrs: string) => {
    let a = attrs;
    if (!/\bwidth=/.test(a)) a += ` width="${W}"`;
    if (!/\bheight=/.test(a)) a += ` height="${H}"`;
    return `<svg${a}>`;
  });

  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const SCALE = 2.5; // resolución retina
      const canvas = document.createElement("canvas");
      canvas.width = W * SCALE;
      canvas.height = H * SCALE;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); URL.revokeObjectURL(url); return; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// ── encabezado y pie de página compartidos ───────────────────────────────────

function addHeader(
  pdf: jsPDF,
  logoLeft: string | null,
  logoRight: string | null,
  date: Date
) {
  const W = pdf.internal.pageSize.getWidth();
  const HEADER_H = 34;

  pdf.setFillColor(...BURGUNDY);
  pdf.rect(0, 0, W, HEADER_H, "F");

  const LOGO_W = 36;
  const LOGO_H = 20;
  const logoY = (HEADER_H - LOGO_H) / 2;

  if (logoLeft) {
    try { pdf.addImage(logoLeft, "PNG", 6, logoY, LOGO_W, LOGO_H); } catch { /**/ }
  } else {
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("INEGI", 8, HEADER_H / 2 + 2);
  }

  if (logoRight) {
    try { pdf.addImage(logoRight, "PNG", W - LOGO_W - 6, logoY, LOGO_W, LOGO_H); } catch { /**/ }
  } else {
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("Gob. Hidalgo", W - 26, HEADER_H / 2 + 2);
  }

  const cx = W / 2;
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13.5);
  pdf.text("Informe de Resultados — INEGI Hidalgo", cx, 12, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(
    "Instituto Nacional de Estadística y Geografía  ·  Gobierno del Estado de Hidalgo",
    cx, 20, { align: "center" }
  );

  const dateStr = date.toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });
  pdf.setFontSize(7);
  pdf.text(`Generado: ${dateStr}`, cx, 28, { align: "center" });
}

function addFooter(pdf: jsPDF, page: number, total: number) {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const FH = 11;
  const fy = H - FH;

  pdf.setFillColor(...BURGUNDY);
  pdf.rect(0, fy, W, FH, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.text("INEGI  ·  Gobierno del Estado de Hidalgo  ·  CensoCitnova", 8, fy + 7);
  pdf.text(`Página ${page} de ${total}`, W - 8, fy + 7, { align: "right" });
}

// ── exportar pestaña Módulos ──────────────────────────────────────────────────

export interface ExportModulesOptions {
  chartElement: HTMLElement;
  censusName: string;
  modules: CensusModuleItem[];
}

export async function exportModulesPdf(opts: ExportModulesOptions): Promise<void> {
  const { chartElement, censusName, modules } = opts;
  const date = new Date();

  const [logoLeft, logoRight, chartImgData] = await Promise.all([
    loadAsBase64("/INEGI.svg"),
    loadAsBase64("/logo_gobierno_gold.png"),
    extractChartSvgAsPng(chartElement),
  ]);

  const pdf = new jsPDF("p", "mm", "letter");
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  addHeader(pdf, logoLeft, logoRight, date);

  let y = 40;

  // Título sección
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...BURGUNDY);
  pdf.text("Distribución de preguntas por módulo", 14, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...MID);
  pdf.text(censusName, 14, y + 5.5);

  pdf.setDrawColor(...BURGUNDY);
  pdf.setLineWidth(0.4);
  pdf.line(14, y + 9, W - 14, y + 9);
  y += 13;

  // ── Gráfica (izquierda) + Leyenda de colores (derecha) ───────────────────
  const total = modules.reduce((s, m) => s + m.questions_count, 0);
  const CHART_SIZE = 63; // mm — cuadrada (el SVG de Recharts es 1:1)
  const LEGEND_X = 14 + CHART_SIZE + 8; // columna derecha
  const LEGEND_W = W - LEGEND_X - 14;
  const ITEM_H = 7; // altura por item de leyenda

  const chartEnd = y + CHART_SIZE;

  if (chartImgData) {
    pdf.addImage(chartImgData, "PNG", 14, y, CHART_SIZE, CHART_SIZE);
  }

  // Leyenda de colores al lado del gráfico
  let legendY = y + 4;
  modules.forEach((mod, i) => {
    const [r, g, b] = hexToRgb(PALETTE[i % PALETTE.length]);
    const pct = total > 0 ? ((mod.questions_count / total) * 100).toFixed(1) : "0.0";

    // Cuadro de color
    pdf.setFillColor(r, g, b);
    pdf.rect(LEGEND_X, legendY, 4, 4, "F");
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.rect(LEGEND_X, legendY, 4, 4);

    // Nombre del módulo (truncado si excede el ancho disponible)
    const maxChars = Math.floor(LEGEND_W / 1.55); // ~1.55mm por char a 8pt
    const name =
      mod.module_name.length > maxChars
        ? mod.module_name.slice(0, maxChars - 2) + "…"
        : mod.module_name;

    pdf.setTextColor(...DARK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(name, LEGEND_X + 6, legendY + 3.2);

    // Conteo y porcentaje en la segunda mini-línea
    pdf.setFontSize(7);
    pdf.setTextColor(...MID);
    pdf.text(
      `${mod.questions_count} pregunta${mod.questions_count !== 1 ? "s" : ""}  ·  ${pct}%`,
      LEGEND_X + 6,
      legendY + 3.2 + 3.5
    );

    legendY += ITEM_H + 2;
  });

  // El siguiente bloque empieza debajo de lo más alto (gráfica o leyenda)
  y = Math.max(chartEnd, legendY) + 6;

  // ── Cuadro de totales ─────────────────────────────────────────────────────
  pdf.setFillColor(...LIGHT_BG);
  pdf.roundedRect(14, y, W - 28, 14, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(...DARK);
  pdf.text(`Total de módulos: ${modules.length}`, 20, y + 5.5);
  pdf.text(`Total de preguntas: ${total}`, 20, y + 11);
  y += 18;

  // ── Tabla de módulos con cuadro de color en cada fila ────────────────────
  pdf.setFillColor(...BURGUNDY);
  pdf.rect(14, y, W - 28, 7.5, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("Módulo", 23, y + 5.3); // desplazado para dar espacio al cuadrito
  pdf.text("Preguntas", W - 52, y + 5.3);
  pdf.text("Porcentaje", W - 16, y + 5.3, { align: "right" });
  y += 7.5;

  const ROW_H = 8;
  modules.forEach((mod, i) => {
    if (y + ROW_H > H - 18) {
      addFooter(pdf, pdf.getCurrentPageInfo().pageNumber, 1);
      pdf.addPage();
      addHeader(pdf, logoLeft, logoRight, date);
      y = 40;
    }

    if (i % 2 === 0) {
      pdf.setFillColor(250, 248, 245);
      pdf.rect(14, y, W - 28, ROW_H, "F");
    }

    // Cuadro de color en la fila
    const [r, g, b] = hexToRgb(PALETTE[i % PALETTE.length]);
    pdf.setFillColor(r, g, b);
    pdf.rect(15.5, y + 2.3, 3.5, 3.5, "F");
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.rect(15.5, y + 2.3, 3.5, 3.5);

    const pct = total > 0 ? ((mod.questions_count / total) * 100).toFixed(1) : "0.0";
    const name =
      mod.module_name.length > 58
        ? mod.module_name.slice(0, 55) + "..."
        : mod.module_name;

    pdf.setTextColor(...DARK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text(name, 21, y + 5.5); // empieza después del cuadrito
    pdf.text(String(mod.questions_count), W - 52, y + 5.5);
    pdf.text(`${pct}%`, W - 16, y + 5.5, { align: "right" });
    y += ROW_H;
  });

  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    addFooter(pdf, p, totalPages);
  }

  const safeTitle = censusName.replace(/[^a-zA-Z0-9À-ɏ ]/g, "").trim().replace(/\s+/g, "-").slice(0, 40);
  pdf.setProperties({
    title: `Informe de Resultados — ${censusName}`,
    author: "CensoCitnova",
    subject: `Distribución de preguntas por módulo — ${censusName}`,
    creator: "CensoCitnova · INEGI Hidalgo",
  });

  pdf.save(`informe-${safeTitle}-${date.toISOString().slice(0, 10)}.pdf`);
}

// ── exportar pestaña Censos ───────────────────────────────────────────────────

export interface ExportCensosOptions {
  censusName: string;
  totalQuestions: number;
  resolvedQuestions: number;
}

export async function exportCensosPdf(opts: ExportCensosOptions): Promise<void> {
  const { censusName, totalQuestions, resolvedQuestions } = opts;
  const date = new Date();
  const pct = totalQuestions > 0 ? (resolvedQuestions / totalQuestions) * 100 : 0;
  const pending = totalQuestions - resolvedQuestions;

  const [logoLeft, logoRight] = await Promise.all([
    loadAsBase64("/INEGI.svg"),
    loadAsBase64("/logo_gobierno_gold.png"),
  ]);

  const pdf = new jsPDF("p", "mm", "letter");
  const W = pdf.internal.pageSize.getWidth();

  addHeader(pdf, logoLeft, logoRight, date);

  let y = 40;

  // Título sección
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...BURGUNDY);
  pdf.text("Avance de cuestionario", 14, y);

  pdf.setDrawColor(...BURGUNDY);
  pdf.setLineWidth(0.4);
  pdf.line(14, y + 5, W - 14, y + 5);
  y += 12;

  // Ficha del cuestionario
  pdf.setFillColor(...LIGHT_BG);
  pdf.roundedRect(14, y, W - 28, 26, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(...BURGUNDY);
  pdf.text(censusName, 20, y + 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...DARK);
  pdf.text(`Total de preguntas:     ${totalQuestions}`, 20, y + 17);
  pdf.text(`Preguntas resueltas:    ${resolvedQuestions}`, 20, y + 23.5);
  y += 32;

  // Barra de progreso
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...DARK);
  pdf.text("Progreso de resolución", 14, y);
  y += 6;

  const BAR_W = W - 28;
  const BAR_H = 12;

  pdf.setFillColor(210, 210, 210);
  pdf.roundedRect(14, y, BAR_W, BAR_H, 2, 2, "F");

  const filled = (pct / 100) * BAR_W;
  if (filled > 0) {
    pdf.setFillColor(...BURGUNDY);
    pdf.roundedRect(14, y, Math.max(filled, 4), BAR_H, 2, 2, "F");
  }

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  if (filled > 20) {
    pdf.text(`${pct.toFixed(1)}%`, 14 + filled / 2, y + 8, { align: "center" });
  }

  y += BAR_H + 4;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...MID);
  pdf.text(
    `${pct.toFixed(1)}% completado  —  ${resolvedQuestions} resueltas  ·  ${pending} pendientes`,
    14, y
  );
  y += 10;

  // Tabla resumen
  const rows: [string, string][] = [
    ["Total de preguntas", String(totalQuestions)],
    ["Preguntas resueltas", String(resolvedQuestions)],
    ["Preguntas pendientes", String(pending)],
    ["Porcentaje completado", `${pct.toFixed(2)}%`],
  ];

  const ROW_H = 8.5;
  pdf.setFillColor(...BURGUNDY);
  pdf.rect(14, y, W - 28, 7.5, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("Indicador", 18, y + 5.3);
  pdf.text("Valor", W - 16, y + 5.3, { align: "right" });
  y += 7.5;

  rows.forEach(([label, val], i) => {
    if (i % 2 === 0) {
      pdf.setFillColor(250, 248, 245);
      pdf.rect(14, y, W - 28, ROW_H, "F");
    }
    pdf.setTextColor(...DARK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(label, 18, y + 6);
    pdf.text(val, W - 16, y + 6, { align: "right" });
    y += ROW_H;
  });

  addFooter(pdf, 1, 1);

  const safeTitle = censusName.replace(/[^a-zA-Z0-9À-ɏ ]/g, "").trim().replace(/\s+/g, "-").slice(0, 40);
  pdf.setProperties({
    title: `Informe de Resultados — ${censusName}`,
    author: "CensoCitnova",
    subject: `Avance de cuestionario — ${censusName}`,
    creator: "CensoCitnova · INEGI Hidalgo",
  });

  pdf.save(`informe-${safeTitle}-${date.toISOString().slice(0, 10)}.pdf`);
}
