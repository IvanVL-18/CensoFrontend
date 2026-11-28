import {
  answeredBlocks,
  fichaItems,
  fichaText,
  groupedRowName,
  listCellText,
  listColumns,
  listGroups,
  looseFields,
  mergedRows,
} from "../../lib/compiledAnswers";
import {
  anchorLabel,
  blockTemplate,
  blockTitle,
  withYears,
  type AnswerRow,
  type AnswerValue,
  type CompiledTemplate,
} from "../../lib/compiledTemplate";
import type { RowSource, SectionBundle } from "./CensusAnswers.types";

const HEADER = ["Pregunta", "Texto de la pregunta", "Bloque", "Tabla", "Fila", "Nombre de la fila", "Campo", "Respuesta"];

/** Número si el texto es solo una cifra con formato es-MX; si no, el texto. */
const cellValue = (text: string): string | number => {
  const plain = text.replace(/,/g, "");
  return /^-?\d+(\.\d+)?$/.test(plain) ? Number(plain) : text;
};

/**
 * Descarga las respuestas de una sección en un Excel de lectura: una fila por cada campo
 * contestado, con la pregunta, el bloque repetido («Programa 3»), la tabla y la fila a la que
 * pertenece. Los códigos van con su etiqueta y las marcas con X como las opciones marcadas,
 * igual que en la vista digital.
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
  sheet.columns = [
    { width: 14 },
    { width: 60 },
    { width: 16 },
    { width: 8 },
    { width: 6 },
    { width: 36 },
    { width: 50 },
    { width: 40 },
  ];
  const header = sheet.addRow(HEADER);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF691B31" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const entry of bundle.questions) {
    const anchor = entry.question.anchor;
    const number = anchorLabel(anchor);
    const text = withYears(entry.question.text, year);
    const { template } = entry.question;
    const { answer } = entry;
    if (!answer) {
      sheet.addRow([number, text, "", "", "", "", "(en blanco)", ""]);
      continue;
    }

    // Los campos sueltos y las tablas de lista de la pregunta o de uno de sus bloques repetidos.
    const addParts = (
      block: string,
      part: CompiledTemplate,
      values: Readonly<Record<string, AnswerValue>>,
      lists: AnswerRow[][],
      sources: RowSource[],
    ) => {
      for (const item of fichaItems(looseFields(part), year)) {
        const value = fichaText(item, values);
        if (value !== "") sheet.addRow([number, text, block, "", "", "", item.label || "Respuesta", cellValue(value)]);
      }

      listGroups(part, anchor).forEach((group, groupIndex) => {
        const columns = listColumns(part, group, year);
        const names = sources.find((source) => group.includes(source.list))?.rows ?? {};
        for (const row of mergedRows(group, lists)) {
          // El nombre de la fila: el que viene de otra pregunta o, si no, el de su grupo de filas.
          const name = names[String(row._row)] ?? groupedRowName(part, group, row._row);
          for (const column of columns) {
            const value = listCellText(column, row);
            if (value !== "") {
              sheet.addRow([number, text, block, groupIndex + 1, row._row, name, column.label, cellValue(value)]);
            }
          }
        }
      });
    };

    addParts("", template, answer.fields, answer.lists, entry.row_sources);

    const model = blockTemplate(template);
    if (template.repeat && model) {
      for (const block of answeredBlocks(answer)) {
        addParts(blockTitle(template.repeat, block._block), model, block.fields, block.lists, []);
      }
    }

    if (answer.comment) {
      sheet.addRow([number, text, "", "", "", "", "Comentario del informante", answer.comment]);
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
