import { useMemo } from "react";
import { answeredBlocks, blocksSummary, listGroups, listSources, looseFields, looseView } from "../../lib/compiledAnswers";
import {
  anchorLabel,
  blockTemplate,
  blockTitle,
  continuationNote,
  fieldLabel,
  type AnswerRow,
  type AnswerValue,
  type CompiledAnswer,
  type CompiledTemplate,
} from "../../lib/compiledTemplate";
import CompiledGrid from "../CompiledGrid";
import { AnswerBreakdown } from "./AnswerBreakdown";
import { AnswerFicha } from "./AnswerFicha";
import { AnswerListTable } from "./AnswerListTable";

/** Nombre de las filas de una tabla que se llena con otra pregunta. */
export interface AnswerRowSource {
  list: number;
  anchor: string;
  label: string[];
  rows: Readonly<Record<string, string>>;
}

/** Campos sueltos de la edición anterior, por las mismas claves. */
type PreviousValues = { year: number; values: Readonly<Record<string, AnswerValue>> };

interface DigitalAnswerProps {
  template: CompiledTemplate;
  answer: CompiledAnswer;
  /** Número de la pregunta: sirve para saber qué tablas son bloques de la misma. */
  anchor: string;
  editionYear: number;
  rowSources?: readonly AnswerRowSource[];
  /** «digital»: acomodada para leerse; «excel»: con la misma forma que en el cuaderno. */
  mode: "digital" | "excel";
  previous?: PreviousValues;
}

/**
 * Las respuestas de una pregunta compilada (docs/CARGA_CENSOS.md, §7.7). En digital la vista
 * se elige por la forma de la pregunta: ficha para las simples, desglose para las tablas fijas
 * y una tabla por cada tabla de lista. Si la pregunta trae bloques repetidos («Programa 1»,
 * «Programa 2»…), cada bloque contestado se lee con esas mismas vistas. La copia fiel queda
 * siempre a un clic, para cotejar.
 */
export function DigitalAnswer({ template, answer, anchor, editionYear, rowSources = [], mode, previous }: DigitalAnswerProps) {
  const { repeat } = template;
  const block = useMemo(() => blockTemplate(template), [template]);
  const blocks = useMemo(() => answeredBlocks(answer), [answer]);
  const continues = continuationNote(template);
  const note = continues ? <p className="text-xs text-gray-500">{continues}.</p> : null;

  if (mode === "excel") {
    const rowNames: Record<number, Readonly<Record<string, string>>> = {};
    for (const source of rowSources) rowNames[source.list] = source.rows;

    return (
      <div className="space-y-4">
        {note}
        <CompiledGrid
          template={template}
          editionYear={editionYear}
          values={answer.fields}
          lists={answer.lists}
          rowNames={rowNames}
          blocks={blocks}
        />
        <Comment text={answer.comment} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {note}
      <AnswerParts
        template={template}
        values={answer.fields}
        lists={answer.lists}
        anchor={anchor}
        editionYear={editionYear}
        rowSources={rowSources}
        previous={previous}
      />

      {repeat && block && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{blocksSummary(repeat, blocks.length)}</p>
          {blocks.map((item) => (
            <section key={item._block} className="rounded-lg border border-gray-200">
              <h4 className="rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
                {blockTitle(repeat, item._block)}
              </h4>
              <div className="space-y-4 p-3">
                <AnswerParts template={block} values={item.fields} lists={item.lists} anchor={anchor} editionYear={editionYear} />
              </div>
            </section>
          ))}
        </div>
      )}

      <Comment text={answer.comment} />
    </div>
  );
}

interface AnswerPartsProps {
  /** La pregunta, o su bloque repetido visto como plantilla. */
  template: CompiledTemplate;
  values: Readonly<Record<string, AnswerValue>>;
  lists: readonly AnswerRow[][];
  anchor: string;
  editionYear: number;
  rowSources?: readonly AnswerRowSource[];
  previous?: PreviousValues;
}

/** Los campos sueltos y las tablas de lista de una pregunta o de uno de sus bloques repetidos. */
function AnswerParts({ template, values, lists: answers, anchor, editionYear, rowSources = [], previous }: AnswerPartsProps) {
  const loose = useMemo(() => looseFields(template), [template]);
  const view = useMemo(() => looseView(loose, editionYear), [loose, editionYear]);
  const groups = useMemo(() => listGroups(template, anchor), [template, anchor]);
  const sources = useMemo(() => listSources(template), [template]);

  const namesOf = (lists: number[]) => {
    const source = rowSources.find((item) => lists.includes(item.list));
    if (!source) return undefined;
    return { anchor: source.anchor, label: source.label.join(" › "), rows: source.rows };
  };

  const ficha =
    view.ficha.length > 0 ? <AnswerFicha fields={view.ficha} values={values} editionYear={editionYear} previous={previous} /> : null;

  return (
    <>
      {view.fichaFirst && ficha}
      {view.breakdown && <AnswerBreakdown breakdown={view.breakdown} values={values} previous={previous} />}
      {!view.fichaFirst && ficha}

      {groups.map((lists) => {
        const source = sources[lists[0]];
        const names = namesOf(lists);
        const first = template.fields.find((field) => field.list === lists[0]);

        return (
          <div key={lists.join("-")} className="space-y-1">
            {(groups.length > 1 || loose.length > 0) && (
              <p className="text-sm font-medium text-gray-800">
                {groups.length > 1 ? `Tabla ${groups.indexOf(lists) + 1}` : "Tabla"}
                {first && groups.length > 1 && (
                  <span className="font-normal text-gray-500"> · empieza en «{fieldLabel(first, editionYear) || "Respuesta"}»</span>
                )}
              </p>
            )}
            {source && source !== anchor && !names && (
              <p className="text-xs text-gray-500">Cada fila corresponde a la misma fila de la pregunta {anchorLabel(source)}.</p>
            )}
            <AnswerListTable template={template} lists={lists} answers={answers} editionYear={editionYear} rowNames={names} />
          </div>
        );
      })}
    </>
  );
}

function Comment({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Comentario del informante</p>
      <p className="mt-1 whitespace-pre-line text-sm text-gray-900">{text}</p>
    </div>
  );
}
