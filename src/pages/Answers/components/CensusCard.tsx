import { Calendar, ClipboardList } from "lucide-react";
import type { MyCensus } from "../Answers.types";

interface CensusCardProps {
  census: MyCensus;
  onSelect: (census: MyCensus) => void;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

export function CensusCard({ census, onSelect }: CensusCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(census)}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[var(--pantone-7421)]/30 hover:-translate-y-0.5 transition-all duration-150 group"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-10 w-10 rounded-lg bg-[var(--pantone-7421)]/10 flex items-center justify-center group-hover:bg-[var(--pantone-7421)]/20 transition-colors">
          <ClipboardList size={20} className="text-[var(--pantone-7421)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 group-hover:text-[var(--pantone-7421)] transition-colors leading-tight">
            {census.name}
          </h3>
          {census.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {census.description}
            </p>
          )}
          {(census.init_date || census.deadline) && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Calendar size={12} />
              <span>
                {formatDate(census.init_date)} — {formatDate(census.deadline)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
