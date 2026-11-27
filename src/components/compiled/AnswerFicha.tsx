import clsx from "clsx";
import { fichaItems, fichaText } from "../../lib/compiledAnswers";
import type { AnswerValue, TemplateField } from "../../lib/compiledTemplate";
import { AnswerText } from "./AnswerText";

interface AnswerFichaProps {
  fields: TemplateField[];
  values: Readonly<Record<string, AnswerValue>>;
  editionYear: number;
  /** Lo que se respondió en la edición anterior, por las mismas claves. */
  previous?: { year: number; values: Readonly<Record<string, AnswerValue>> };
}

/**
 * Ficha de una pregunta simple: cada campo con su etiqueta y su respuesta en palabras
 * («Sí», no «1»). Las marcas con X del mismo encabezado se leen juntas.
 */
export function AnswerFicha({ fields, values, editionYear, previous }: AnswerFichaProps) {
  const items = fichaItems(fields, editionYear);
  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        {previous && (
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Campo
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Respuesta
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                En {previous.year}
              </th>
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => {
            const text = fichaText(item, values);
            const before = previous ? fichaText(item, previous.values) : "";
            const changed = previous !== undefined && before !== text;

            return (
              <tr key={item.id} className="align-top">
                <th scope="row" className="w-2/5 px-4 py-2 text-left font-normal text-gray-700">
                  {item.label || "Respuesta"}
                </th>
                <td className="px-4 py-2 font-medium text-gray-900">
                  <AnswerText text={text} />
                </td>
                {previous && (
                  <td className={clsx("px-4 py-2", changed ? "text-gray-800" : "text-gray-500")}>
                    <AnswerText text={before} />
                    {!changed && text !== "" && <span className="ml-1 text-xs">(igual)</span>}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
