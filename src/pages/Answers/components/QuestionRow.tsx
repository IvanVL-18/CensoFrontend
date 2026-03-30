import { CheckCircle2, Circle } from "lucide-react";
import type { CensusQuestion } from "../Answers.types";

interface QuestionRowProps {
  question: CensusQuestion;
  onOpen: (question: CensusQuestion) => void;
}

export function QuestionRow({ question, onOpen }: QuestionRowProps) {
  const isAnswered = question.answer !== null;

  return (
    <button
      type="button"
      onClick={() => onOpen(question)}
      className="w-full flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-[var(--pantone-7421)]/5 transition-colors text-left group"
    >
      {/* Ícono de estado */}
      <div className="mt-0.5 shrink-0">
        {isAnswered ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          <Circle size={20} className="text-gray-300" />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {question.index && (
            <span className="text-xs font-mono font-bold text-[var(--pantone-7421)]/60 shrink-0 mt-0.5">
              {question.index}
            </span>
          )}
          <span className="text-sm font-medium text-gray-800 group-hover:text-[var(--pantone-7421)] transition-colors line-clamp-2">
            {question.name}
          </span>
        </div>
        {question.instructions && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 pl-0">
            {question.instructions}
          </p>
        )}
      </div>

      {/* Badge de estado */}
      <span
        className={`shrink-0 self-center text-xs font-medium px-2 py-0.5 rounded-full ${
          isAnswered
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {isAnswered ? "Respondida" : "Pendiente"}
      </span>
    </button>
  );
}
