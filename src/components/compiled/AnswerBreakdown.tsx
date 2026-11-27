import { useMemo } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { checkTotals, type Breakdown } from "../../lib/compiledAnswers";
import { formatAnswerValue, type AnswerValue } from "../../lib/compiledTemplate";
import { AnswerText } from "./AnswerText";

interface AnswerBreakdownProps {
  breakdown: Breakdown;
  values: Readonly<Record<string, AnswerValue>>;
  /** Lo que se respondió en la edición anterior, por las mismas claves. */
  previous?: { year: number; values: Readonly<Record<string, AnswerValue>> };
}

const numberFormat = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 6 });

/**
 * Desglose de una tabla fija: cada concepto en su renglón, con las sumas comprobadas y, si
 * existe, el dato de la edición anterior al lado (docs/CARGA_CENSOS.md, §7.7).
 */
export function AnswerBreakdown({ breakdown, values, previous }: AnswerBreakdownProps) {
  const totals = useMemo(() => checkTotals(breakdown, values), [breakdown, values]);

  // La columna que se compara con la edición anterior: «Total» si existe; si no, la primera.
  const compared = Math.max(0, breakdown.columns.indexOf("Total"));

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Concepto
              </th>
              {breakdown.columns.map((column) => (
                <th key={column} scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                  {column || "Respuesta"}
                </th>
              ))}
              {previous && (
                <th scope="col" className="border-l border-gray-200 px-4 py-2 text-right text-xs font-medium text-gray-600">
                  {breakdown.columns[compared] || "Respuesta"} en {previous.year}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {breakdown.rows.map((row) => {
              const now = row.cells[compared] ? values[row.cells[compared]!.key] : undefined;
              const before = previous && row.cells[compared] ? previous.values[row.cells[compared]!.key] : undefined;

              return (
                <tr key={row.id} className="align-top">
                  <th
                    scope="row"
                    title={row.path.join(" › ")}
                    className="px-4 py-2 text-left font-normal text-gray-800"
                    style={{ paddingLeft: `${1 + row.depth * 1.25}rem` }}
                  >
                    {row.label || "Total"}
                  </th>
                  {row.cells.map((field, index) => (
                    <td key={index} className="whitespace-nowrap px-4 py-2 text-right font-medium tabular-nums text-gray-900">
                      {field ? <AnswerText text={formatAnswerValue(field, values[field.key])} /> : null}
                    </td>
                  ))}
                  {previous && (
                    <td className="whitespace-nowrap border-l border-gray-200 px-4 py-2 text-right tabular-nums text-gray-600">
                      <AnswerText text={formatAnswerValue(row.cells[compared], before)} />
                      {typeof now === "number" && typeof before === "number" && (
                        <span className="ml-2 text-xs text-gray-500">
                          {now === before ? "=" : `${now > before ? "+" : "−"}${numberFormat.format(Math.abs(now - before))}`}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totals.checked > 0 && totals.mismatches.length === 0 && (
        <p className="flex items-start gap-1.5 text-xs text-green-800">
          <CircleCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          Las sumas coinciden ({totals.checked === 1 ? "1 comprobada" : `${totals.checked} comprobadas`}).
        </p>
      )}
      {totals.mismatches.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <p className="flex items-start gap-1.5 font-medium">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            {totals.mismatches.length === 1 ? "Una suma no coincide" : `${totals.mismatches.length} sumas no coinciden`} con lo
            que dice el Excel. Se muestra el valor del Excel.
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-6">
            {totals.mismatches.map((mismatch, index) => (
              <li key={index}>
                «{mismatch.row}», {mismatch.column || "respuesta"}: dice {numberFormat.format(mismatch.stated)} y{" "}
                {mismatch.kind === "row" ? "hombres más mujeres suman" : "su desglose suma"} {numberFormat.format(mismatch.sum)}.
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
