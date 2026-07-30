import { Fragment, type ReactNode } from "react";

/**
 * Render mínimo de Markdown para las respuestas de la IA.
 *
 * El modelo contesta con negritas, listas y tablas, así que en texto plano se
 * ven los asteriscos y los pipes crudos. Se resuelve aquí en vez de con
 * react-markdown para no meter una dependencia nueva al proyecto: solo se
 * cubre lo que el asistente realmente emite (encabezados, negritas, cursivas,
 * código en línea, listas y tablas).
 *
 * El texto viene del modelo y se inserta siempre como children de React, nunca
 * con dangerouslySetInnerHTML, así que no hay riesgo de inyección de HTML.
 */

/** Aplica los formatos en línea: **negrita**, *cursiva* y `código`. */
const renderInline = (text: string): ReactNode[] => {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return <strong key={i}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em] font-mono text-gray-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return <em key={i}>{token.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{token}</Fragment>;
  });
};

const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

/** Una fila separadora de tabla: |---|---| */
const isTableDivider = (line: string): boolean =>
  /^\s*\|?[\s:-]*-[\s|:-]*\|?\s*$/.test(line) && line.includes("-");

export function ChatMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="whitespace-pre-wrap">
        {renderInline(paragraph.join("\n"))}
      </p>,
    );
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Tabla: fila de encabezado seguida de la separadora.
    if (line.includes("|") && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flushParagraph();
      const headers = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      i--;

      blocks.push(
        // La burbuja del chat es angosta; la tabla scrollea sola en vez de
        // desbordar el contenedor.
        <div key={`t-${blocks.length}`} className="overflow-x-auto">
          <table className="w-full text-left text-[0.9em] border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                {headers.map((h, hi) => (
                  <th key={hi} className="py-1 pr-3 font-semibold whitespace-nowrap">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-gray-100 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-1 pr-3 align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Encabezados: #, ##, ###
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push(
        <p key={`h-${blocks.length}`} className="font-semibold">
          {renderInline(heading[2])}
        </p>,
      );
      continue;
    }

    // Listas: con viñeta (-, *) o numeradas (1.)
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      const items: ReactNode[] = [];
      const ordered = Boolean(numbered);

      while (i < lines.length) {
        const b = /^\s*[-*]\s+(.*)$/.exec(lines[i]);
        const n = /^\s*(\d+)\.\s+(.*)$/.exec(lines[i]);
        if (ordered && n) items.push(n[2]);
        else if (!ordered && b) items.push(b[1]);
        else break;
        i++;
      }
      i--;

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`l-${blocks.length}`}
          className={
            ordered
              ? "list-decimal pl-5 space-y-0.5"
              : "list-disc pl-5 space-y-0.5"
          }
        >
          {items.map((item, ii) => (
            <li key={ii}>{renderInline(String(item))}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();

  return <div className="space-y-2">{blocks}</div>;
}
