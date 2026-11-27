import { Fragment, type ReactNode } from "react";
import clsx from "clsx";
import {
  fieldHint,
  fieldLabel,
  formatAnswerValue,
  isSpecialValue,
  withYears,
  type AnswerRow,
  type AnswerValue,
  type CompiledTemplate,
  type GridCell,
  type GridRow,
  type TemplateField,
} from "../lib/compiledTemplate";

interface CompiledGridProps {
  template: CompiledTemplate;
  /** Edición con la que se sustituyen los marcadores de año. */
  editionYear: number;
  /** Claves de los campos que se resaltan (por ejemplo, los que cambiaron). */
  highlight?: ReadonlySet<string>;
  /**
   * Respuestas de los campos sueltos, por clave. Con ellas las celdas de captura
   * muestran lo que se contestó; sin ellas, qué se escribe en cada una.
   */
  values?: Readonly<Record<string, AnswerValue>>;
  /**
   * Filas contestadas de cada tabla de lista, en el orden de la plantilla. Con ellas cada
   * tabla se dibuja con sus filas contestadas en lugar de las tres filas de muestra.
   */
  lists?: readonly AnswerRow[][];
  /** Nombre de cada fila de una tabla (por posición de la lista y número de fila), para las celdas que se llenan solas. */
  rowNames?: Readonly<Record<number, Readonly<Record<string, string>>>>;
}

/**
 * Copia fiel de una pregunta compilada: la dibuja con la misma forma que tiene en
 * el Excel, desde la rejilla de su plantilla (docs/CARGA_CENSOS.md, §7.3). Sin
 * respuestas, las celdas de captura dicen qué se escribe en ellas; con `values` y
 * `lists`, muestran lo que se contestó.
 */
export default function CompiledGrid({ template, editionYear, highlight, values, lists, rowNames }: CompiledGridProps) {
  const { grid } = template;
  if (grid.rows.length === 0) {
    return <p className="text-sm text-gray-500">Esta pregunta no tiene una tabla que dibujar.</p>;
  }

  const fields = new Map(template.fields.map((field) => [field.key, field]));
  const answered = values !== undefined || lists !== undefined;

  // A qué tabla de lista pertenece cada fila de la rejilla (por sus celdas de captura).
  const listOf = (row: GridRow): number | undefined => {
    for (const cell of row.cells) {
      const list = cell.f ? fields.get(cell.f)?.list : undefined;
      if (list !== undefined) return list;
    }
    return undefined;
  };

  const body: ReactNode[] = [];
  for (let index = 0; index < grid.rows.length; index++) {
    const row = grid.rows[index];
    const list = lists ? listOf(row) : undefined;

    if (list === undefined) {
      body.push(
        <Fragment key={index}>
          <tr>
            {row.cells.map((cell, cellIndex) => (
              <Cell
                key={cellIndex}
                cell={cell}
                field={cell.f ? fields.get(cell.f) : undefined}
                editionYear={editionYear}
                highlighted={Boolean(cell.f && highlight?.has(cell.f))}
                answered={answered}
                value={cell.f ? values?.[cell.f] : undefined}
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
        </Fragment>,
      );
      continue;
    }

    // Tabla de lista con respuestas: la primera fila de muestra sirve de molde para cada fila contestada.
    let end = index;
    while (end + 1 < grid.rows.length && listOf(grid.rows[end + 1]) === list) end++;
    const rows = lists?.[list] ?? [];
    const total = template.lists[list]?.rows ?? rows.length;

    rows.forEach((answer) => {
      body.push(
        <tr key={`${index}-${answer._row}`}>
          {row.cells.map((cell, cellIndex) => {
            if (cell.k === "k") {
              return (
                <td key={cellIndex} colSpan={cell.cs ?? 1} className="border border-gray-200 px-1.5 py-1 text-center tabular-nums text-gray-500">
                  {answer._row}.
                </td>
              );
            }
            if (cell.k === "d") {
              const name = rowNames?.[list]?.[String(answer._row)];
              return (
                <td key={cellIndex} colSpan={cell.cs ?? 1} className="border border-gray-200 bg-gray-50 px-1.5 py-1 text-left text-gray-800">
                  {name ?? <span className="italic text-gray-400">{cell.t}</span>}
                </td>
              );
            }
            return (
              <Cell
                key={cellIndex}
                cell={{ ...cell, rs: undefined }}
                field={cell.f ? fields.get(cell.f) : undefined}
                editionYear={editionYear}
                highlighted={false}
                answered
                value={cell.f ? answer[cell.f] : undefined}
              />
            );
          })}
        </tr>,
      );
    });
    body.push(
      <tr key={`${index}-resto`}>
        <td colSpan={grid.cols.length} className="bg-gray-50 px-2 py-1 text-center italic text-gray-500">
          {rows.length === 0
            ? `Sin filas contestadas (de ${total.toLocaleString("es-MX")})`
            : total > rows.length
              ? `… ${(total - rows.length).toLocaleString("es-MX")} ${total - rows.length === 1 ? "fila más" : "filas más"} en blanco`
              : "No quedan filas en blanco"}
        </td>
      </tr>,
    );
    index = end;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[760px] table-fixed border-collapse text-xs">
        <colgroup>
          {grid.cols.map((width, index) => (
            <col key={index} style={{ width: `${width}%` }} />
          ))}
        </colgroup>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

interface CellProps {
  cell: GridCell;
  field?: TemplateField;
  editionYear: number;
  highlighted: boolean;
  /** Se están mostrando respuestas: una celda sin valor es una celda en blanco. */
  answered: boolean;
  value?: AnswerValue;
}

function Cell({ cell, field, editionYear, highlighted, answered, value }: CellProps) {
  const span = { colSpan: cell.cs ?? 1, rowSpan: cell.rs ?? 1 };

  switch (cell.k) {
    case "e":
      return <td {...span} />;

    case "i": {
      const label = field ? fieldLabel(field, editionYear) : "";
      if (answered) {
        const text = formatAnswerValue(field, value);
        return (
          <td
            {...span}
            title={label || "Celda de captura"}
            className={clsx(
              "break-words border border-[var(--pantone-7421)]/40 px-1.5 py-1 text-center align-middle text-xs",
              text === "" ? "bg-gray-50 text-gray-400" : "bg-white font-medium text-gray-900",
              isSpecialValue(value) && "italic text-gray-600",
              highlighted && "outline outline-2 -outline-offset-2 outline-amber-500",
            )}
          >
            <span className="sr-only">{label ? `${label}: ` : "Respuesta: "}</span>
            {text === "" ? <span aria-label="en blanco">—</span> : text}
          </td>
        );
      }
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
