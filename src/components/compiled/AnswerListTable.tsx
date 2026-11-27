import { Fragment, useId, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { listCellText, listColumns, mergedRows } from "../../lib/compiledAnswers";
import type { AnswerRow, CompiledTemplate } from "../../lib/compiledTemplate";
import { AnswerText } from "./AnswerText";

interface AnswerListTableProps {
  template: CompiledTemplate;
  /** Posiciones de las listas que se leen como una sola tabla (bloques «1 de 2», «2 de 2»). */
  lists: number[];
  /** Filas contestadas de todas las listas de la plantilla. */
  answers: readonly AnswerRow[][];
  editionYear: number;
  /** Nombre de cada fila cuando la tabla repite las filas de otra pregunta. */
  rowNames?: { label: string; anchor: string; rows: Readonly<Record<string, string>> };
}

const SEARCH_FROM = 8;

/**
 * Tabla de lista en digital: una fila por renglón contestado, los códigos con su etiqueta y
 * las marcas con X como las opciones marcadas. Si la tabla repite las filas de otra pregunta,
 * cada fila lleva el nombre que se escribió allá. Al abrir una fila se ve completa, en vertical.
 */
export function AnswerListTable({ template, lists, answers, editionYear, rowNames }: AnswerListTableProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const columns = useMemo(() => listColumns(template, lists, editionYear), [template, lists, editionYear]);
  const rows = useMemo(() => mergedRows(lists, answers as AnswerRow[][]), [lists, answers]);
  const total = Math.max(0, ...lists.map((index) => template.lists[index]?.rows ?? 0));

  const texts = useMemo(
    () => rows.map((row) => columns.map((column) => listCellText(column, row))),
    [rows, columns],
  );

  const needle = query.trim().toLowerCase();
  const visible = rows
    .map((row, index) => ({ row, cells: texts[index], name: rowNames?.rows[String(row._row)] }))
    .filter(
      ({ cells, name }) =>
        needle === "" || (name ?? "").toLowerCase().includes(needle) || cells.some((text) => text.toLowerCase().includes(needle)),
    );

  if (rows.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        Sin filas contestadas (la tabla tiene {total.toLocaleString("es-MX")}).
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-600">
          {rows.length.toLocaleString("es-MX")} de {total.toLocaleString("es-MX")} filas con respuesta
          {needle !== "" && ` · ${visible.length.toLocaleString("es-MX")} coinciden`}
        </p>
        {rows.length >= SEARCH_FROM && (
          <div className="relative print:hidden">
            <label htmlFor={searchId} className="sr-only">
              Buscar en la tabla
            </label>
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en la tabla"
              className="w-56 rounded-lg border border-gray-300 py-1 pl-8 pr-2 text-sm focus:border-[var(--pantone-7421)] focus:outline-none focus:ring-1 focus:ring-[var(--pantone-7421)]"
            />
          </div>
        )}
      </div>

      <div className="max-h-[36rem] overflow-auto rounded-lg border border-gray-200 print:max-h-none print:overflow-visible">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 print:static">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Fila
              </th>
              {rowNames && (
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                  {rowNames.label || "Nombre"} <span className="font-normal text-gray-500">(de la {rowNames.anchor})</span>
                </th>
              )}
              {columns.map((column) => (
                <th key={column.id} scope="col" className="min-w-[8rem] px-3 py-2 text-left text-xs font-medium text-gray-600">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-3 py-4 text-center text-gray-500">
                  Ninguna fila coincide con «{query.trim()}».
                </td>
              </tr>
            )}
            {visible.map(({ row, cells, name }) => {
              const expanded = open === row._row;

              return (
                <Fragment key={row._row}>
                  <tr className={clsx("align-top", expanded && "bg-[#F7F3E8]")}>
                    <td className="whitespace-nowrap px-3 py-1.5 tabular-nums text-gray-600">
                      <button
                        type="button"
                        onClick={() => setOpen(expanded ? null : row._row)}
                        aria-expanded={expanded}
                        className="mr-1 inline-flex align-middle text-gray-500 hover:text-[var(--pantone-7421)] print:hidden"
                        title={expanded ? "Cerrar la fila" : "Ver la fila completa"}
                      >
                        {expanded ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
                        <span className="sr-only">
                          {expanded ? "Cerrar" : "Ver completa"} la fila {row._row}
                        </span>
                      </button>
                      {row._row}
                    </td>
                    {rowNames && <td className="px-3 py-1.5 font-medium text-gray-900">{name ?? <AnswerText text="" />}</td>}
                    {cells.map((text, index) => (
                      <td key={columns[index].id} className="px-3 py-1.5 text-gray-900">
                        <AnswerText text={text} />
                      </td>
                    ))}
                  </tr>
                  {expanded && (
                    <tr className="bg-[#F7F3E8] print:hidden">
                      <td colSpan={columns.length + 2} className="px-4 pb-3 pt-1">
                        <dl className="grid gap-x-6 gap-y-2 rounded-lg bg-white p-3 sm:grid-cols-2">
                          {rowNames && name && (
                            <div className="sm:col-span-2">
                              <dt className="text-xs text-gray-500">{rowNames.label || "Nombre"}</dt>
                              <dd className="font-medium text-gray-900">{name}</dd>
                            </div>
                          )}
                          {columns.map((column, index) => (
                            <div key={column.id}>
                              <dt className="text-xs text-gray-500">{column.label}</dt>
                              <dd className="text-gray-900">
                                <AnswerText text={cells[index]} />
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
