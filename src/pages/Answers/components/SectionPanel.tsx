import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CensusSection, CensusQuestion } from "../Answers.types";
import { QuestionRow } from "./QuestionRow";

interface SectionPanelProps {
  section: CensusSection;
  onOpenQuestion: (question: CensusQuestion) => void;
}

export function SectionPanel({ section, onOpenQuestion }: SectionPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const answeredCount = section.questions.filter((q) => q.answer !== null).length;
  const total = section.questions.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? (
            <ChevronDown size={15} className="shrink-0 text-gray-400" />
          ) : (
            <ChevronRight size={15} className="shrink-0 text-gray-400" />
          )}
          <div className="text-left min-w-0">
            <span className="text-sm font-semibold text-gray-700 block truncate">
              {section.index && (
                <span className="font-mono text-[var(--pantone-7421)]/60 mr-1">
                  {section.index}
                </span>
              )}
              {section.name}
            </span>
            {section.instructions && (
              <span className="text-xs text-gray-400 truncate block">
                {section.instructions}
              </span>
            )}
          </div>
        </div>
        <span className="shrink-0 ml-3 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
          {answeredCount}/{total}
        </span>
      </button>

      {expanded && (
        <div className="divide-y divide-gray-100 px-2 py-1">
          {section.questions.length > 0 ? (
            section.questions.map((q) => (
              <QuestionRow key={q.id} question={q} onOpen={onOpenQuestion} />
            ))
          ) : (
            <p className="text-sm text-gray-400 italic px-4 py-3">
              Sin preguntas asignadas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
