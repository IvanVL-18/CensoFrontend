import { fichaItems, fichaText, listCellText, listColumns, listGroups, looseFields, mergedRows } from "../../lib/compiledAnswers";
import { withYears } from "../../lib/compiledTemplate";
import type { SectionBundle } from "./CensusAnswers.types";

const HEADER = ["Pregunta", "Texto de la pregunta", "Tabla", "Fila", "Nombre de la fila", "Campo", "Respuesta"];

/** Número si el texto es solo una cifra con formato es-MX; si no, el texto. */
const cellValue = (text: string): string | number => {
  const plain = text.replace(/,/g, "");
  return /^-?\d+(\.\d+)?$/.test(plain) ? Number(plain) : text;
};

/**
 * Descarga las respuestas de una sección en un Excel de lectura: una fila por cada campo
 * contestado, con la pregunta, la tabla y la fila a la que pertenece. Los códigos van con su
 * etiqueta y las marcas con X como las opciones marcadas, igual que en la vista digital.
 *
 * Son respuestas confidenciales: el archivo queda en el equipo de quien lo descarga.
 */
export async function exportSectionAnswers(bundle: SectionBundle): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");
  const year = bundle.census.year;
  const workbook = new ExcelJS.Workbook();

  const summary = workbook.addWorksheet("Sección");
  summary.columns = [{ width: 22 }, { width: 90 }];
  summary.addRows([
    ["Censo", bundle.census.name],
    ["Módulo", `${bundle.module.number ?? ""} · ${bundle.module.name ?? ""}`],
    ["Sección", `${bundle.section.index} · ${bundle.section.name ?? ""}`],
    ["Institución", bundle.institution ?? ""],
    ["Descargado", new Date().toLocaleString("es-MX")],
    ["Aviso", "Respuestas confidenciales del cuestionario (Ley del SNIEG, arts. 37 y 38). No las compartas fuera del equipo."],
  ]);
  summary.getColumn(1).font = { bold: true };

  const sheet = workbook.addWorksheet("Respuestas");
  sheet.columns = [{ width: 10 }, { width: 60 }, { width: 8 }, { width: 6 }, { width: 36 }, { width: 50 }, { width: 40 }];
  const header = sheet.addRow(HEADER);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF691B31" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const question of bundle.questions) {
    const text = withYears(question.text, year);
    const { template, answer } = question;
    if (!answer) {
      sheet.addRow([question.anchor, text, "", "", "", "(en blanco)", ""]);
      continue;
    }

    for (const item of fichaItems(looseFields(template), year)) {
      const value = fichaText(item, answer.fields);
      if (value !== "") sheet.addRow([question.anchor, text, "", "", "", item.label || "Respuesta", cellValue(value)]);
    }

    listGroups(template, question.anchor).forEach((lists, groupIndex) => {
      const columns = listColumns(template, lists, year);
      const names = question.row_sources.find((source) => lists.includes(source.list))?.rows ?? {};
      for (const row of mergedRows(lists, answer.lists)) {
        for (const column of columns) {
          const value = listCellText(column, row);
          if (value !== "") {
            sheet.addRow([question.anchor, text, groupIndex + 1, row._row, names[String(row._row)] ?? "", column.label, cellValue(value)]);
          }
        }
      }
    });

    if (answer.comment) {
      sheet.addRow([question.anchor, text, "", "", "", "Comentario del informante", answer.comment]);
    }
  }
  sheet.getColumn(2).alignment = { wrapText: true, vertical: "top" };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: HEADER.length } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Respuestas_${bundle.census.program}_${year}_seccion_${bundle.section.index}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
