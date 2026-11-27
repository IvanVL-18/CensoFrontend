import { SPECIAL_VALUE_LABEL } from "../../lib/compiledTemplate";

/**
 * Texto de una respuesta ya formateado. Los valores especiales del INEGI («NS», «NA», «ND»)
 * se señalan como tales; una respuesta vacía se muestra con una raya.
 */
export function AnswerText({ text }: { text: string }) {
  if (text === "") {
    return (
      <span className="text-gray-400" aria-label="en blanco">
        —
      </span>
    );
  }
  if (text in SPECIAL_VALUE_LABEL) {
    return (
      <span className="italic text-gray-700" title={SPECIAL_VALUE_LABEL[text]}>
        {text} <span className="text-xs not-italic text-gray-500">({SPECIAL_VALUE_LABEL[text].toLowerCase()})</span>
      </span>
    );
  }
  return <>{text}</>;
}
