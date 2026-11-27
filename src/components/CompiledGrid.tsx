import { Fragment } from "react";
import clsx from "clsx";
import {
  fieldHint,
  fieldLabel,
  withYears,
  type CompiledTemplate,
  type GridCell,
  type TemplateField,
} from "../lib/compiledTemplate";

interface CompiledGridProps {
  template: CompiledTemplate;
  /** Edición con la que se sustituyen los marcadores de año. */
  editionYear: number;
  /** Claves de los campos que se resaltan (por ejemplo, los que cambiaron). */
  highlight?: ReadonlySet<string>;
}

/**
 * Copia fiel de una pregunta compilada: la dibuja con la misma forma que tiene en
 * el Excel, desde la rejilla de su plantilla (docs/CARGA_CENSOS.md, §7.3). Las
 * celdas de captura muestran qué se escribe en ellas, no respuestas.
 */
export default function CompiledGrid({ template, editionYear, highlight }: CompiledGridProps) {
  const { grid } = template;
  if (grid.rows.length === 0) {
    return <p className="text-sm text-gray-500">Esta pregunta no tiene una tabla que dibujar.</p>;
  }

  const fields = new Map(template.fields.map((field) => [field.key, field]));

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[760px] table-fixed border-collapse text-xs">
        <colgroup>
          {grid.cols.map((width, index) => (
            <col key={index} style={{ width: `${width}%` }} />
          ))}
        </colgroup>
        <tbody>
          {grid.rows.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <tr>
                {row.cells.map((cell, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    cell={cell}
                    field={cell.f ? fields.get(cell.f) : undefined}
                    editionYear={editionYear}
                    highlighted={Boolean(cell.f && highlight?.has(cell.f))}
                  />
                ))}
              </tr>
              {row.fold ? (
                <tr>
                  <td colSpan={grid.cols.length} className="bg-gray-50 px-2 py-1 text-center italic text-gray-500">
                    … {row.fold === 1 ? "1 fila más" : `${row.fold.toLocaleString("es-MX")} filas más`} con la misma forma
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CellProps {
  cell: GridCell;
  field?: TemplateField;
  editionYear: number;
  highlighted: boolean;
}

function Cell({ cell, field, editionYear, highlighted }: CellProps) {
  const span = { colSpan: cell.cs ?? 1, rowSpan: cell.rs ?? 1 };

  switch (cell.k) {
    case "e":
      return <td {...span} />;

    case "i": {
      const label = field ? fieldLabel(field, editionYear) : "";
      return (
        <td
          {...span}
          title={label || "Celda de captura"}
          className={clsx(
            "border border-dashed border-[var(--pantone-7421)] bg-[#F7F3E8] px-1 py-1 text-center text-[10px] text-gray-600",
            highlighted && "outline outline-2 -outline-offset-2 outline-amber-500",
          )}
        >
          <span className="sr-only">Captura{label ? `: ${label}` : ""}. </span>
          {fieldHint(field)}
        </td>
      );
    }

    case "d":
      return (
        <td {...span} className="border border-gray-200 bg-gray-50 px-1.5 py-1 text-center italic text-gray-500">
          {cell.t}
        </td>
      );

    default: {
      const text = withYears(cell.t ?? "", editionYear);
      return (
        <td
          {...span}
          className={clsx(
            "whitespace-pre-line break-words border px-1.5 py-1 align-middle",
            cell.k === "h" && "border-gray-300 bg-gray-100 text-center font-semibold text-gray-800",
            cell.k === "l" && "border-gray-200 text-left text-gray-800",
            cell.k === "k" && "border-gray-200 text-center tabular-nums text-gray-500",
          )}
        >
          {cell.v ? <span className="inline-block [writing-mode:vertical-rl] rotate-180">{text}</span> : text}
        </td>
      );
    }
  }
}
