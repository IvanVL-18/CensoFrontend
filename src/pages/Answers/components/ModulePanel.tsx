import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import type { CensusModule, CensusQuestion } from "../Answers.types";
import { SectionPanel } from "./SectionPanel";

interface ModulePanelProps {
  module: CensusModule;
  onOpenQuestion: (question: CensusQuestion) => void;
}

export function ModulePanel({ module, onOpenQuestion }: ModulePanelProps) {
  const [expanded, setExpanded] = useState(true);

  const totalQuestions = module.sections.reduce(
    (acc, s) => acc + s.questions.length,
    0
  );
  const answeredQuestions = module.sections.reduce(
    (acc, s) =>
      acc + s.questions.filter((q) => q.answer !== null).length,
    0
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[var(--pantone-7421)]/5 hover:bg-[var(--pantone-7421)]/10 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen size={18} className="shrink-0 text-[var(--pantone-7421)]" />
          <div className="text-left min-w-0">
            <span className="text-sm font-bold text-[var(--pantone-7421)] block truncate">
              {module.index && (
                <span className="font-mono mr-1">{module.index}</span>
              )}
              {module.name}
            </span>
            <span className="text-xs text-gray-500">
              {module.sections.length} sección(es)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-xs font-semibold text-[var(--pantone-7421)] bg-white border border-[var(--pantone-7421)]/20 px-2 py-0.5 rounded-full">
            {answeredQuestions}/{totalQuestions}
          </span>
          {expanded ? (
            <ChevronDown size={16} className="text-gray-400" />
          ) : (
            <ChevronRight size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-3 bg-white">
          {module.sections.length > 0 ? (
            module.sections.map((section) => (
              <SectionPanel
                key={section.id}
                section={section}
                onOpenQuestion={onOpenQuestion}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-4">
              Sin secciones asignadas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
