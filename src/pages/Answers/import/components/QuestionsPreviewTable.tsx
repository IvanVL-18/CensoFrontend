import { useState } from "react";
import type { QuestionPreviewRow } from "../ImportAnswers.types";

const ESTADO_STYLES: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  advertencia: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

const ESTADO_LABELS: Record<string, string> = {
  ok: "OK",
  advertencia: "Advertencia",
  error: "Error",
};

/**
 * Resumen por pregunta del preview: código, estado, filas detectadas y
 * advertencias expandibles.
 */
export function QuestionsPreviewTable({
  questions,
}: {
  questions: QuestionPreviewRow[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (codigo: string) =>
    setExpanded((prev) => ({ ...prev, [codigo]: !prev[codigo] }));

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">
              Pregunta
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">
              Estado
            </th>
            <th className="px-4 py-2 text-right font-semibold text-gray-600">
              Filas
            </th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">
              Detalle
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {questions.map((question) => {
            const hasDetail =
              question.warnings.length > 0 ||
              question.error !== null ||
              question.comment !== null;
            const isExpanded = expanded[question.codigo] ?? false;

            return (
              <QuestionRow
                key={question.census_question_id_encrypted}
                question={question}
                hasDetail={hasDetail}
                isExpanded={isExpanded}
                onToggle={() => toggle(question.codigo)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuestionRow({
  question,
  hasDetail,
  isExpanded,
  onToggle,
}: {
  question: QuestionPreviewRow;
  hasDetail: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr>
        <td className="px-4 py-2 font-medium text-gray-800">
          {question.codigo}
        </td>
        <td className="px-4 py-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              ESTADO_STYLES[question.estado] ?? ""
            }`}
          >
            {ESTADO_LABELS[question.estado] ?? question.estado}
          </span>
        </td>
        <td className="px-4 py-2 text-right text-gray-700">
          {question.filas}
        </td>
        <td className="px-4 py-2">
          {hasDetail ? (
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={onToggle}
            >
              {isExpanded ? "Ocultar" : "Ver detalle"}
              {question.warnings.length > 0 &&
                ` (${question.warnings.length})`}
            </button>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={4} className="bg-gray-50 px-6 py-3">
            {question.error && (
              <p className="mb-1 text-sm text-red-700">✖ {question.error}</p>
            )}
            {question.warnings.map((warning, i) => (
              <p key={i} className="mb-1 text-sm text-yellow-800">
                ⚠ {warning}
              </p>
            ))}
            {question.comment && (
              <p className="text-sm text-gray-600">
                💬 Comentario detectado: “{question.comment}”
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
