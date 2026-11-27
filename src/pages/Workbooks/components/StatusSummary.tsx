import clsx from "clsx";
import type { WorkbookFileFilter, WorkbookFileStatus } from "../Workbooks.types";

interface StatusSummaryProps {
  counts: Record<WorkbookFileStatus, number> | null;
  filter: WorkbookFileFilter;
  onFilter: (filter: WorkbookFileFilter) => void;
}

/** Conteo de archivos por estado; cada botón filtra la tabla. */
export function StatusSummary({ counts, filter, onFilter }: StatusSummaryProps) {
  if (!counts) return null;

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const pending = counts.queued + counts.processing;

  const options: { value: WorkbookFileFilter; label: string; count: number }[] = [
    { value: "all", label: "Todos", count: total },
    { value: "pending", label: "Pendientes", count: pending },
    { value: "identified", label: "Identificados", count: counts.identified },
    { value: "duplicate", label: "Duplicados", count: counts.duplicate },
    { value: "unrecognized", label: "No reconocidos", count: counts.unrecognized },
    { value: "failed", label: "Con error", count: counts.failed },
  ];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
      {options.map((option) => {
        const active = filter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onFilter(option.value)}
            className={clsx(
              "rounded-full border px-3 py-1 text-sm transition",
              active
                ? "border-[var(--pantone-7421)] bg-[var(--pantone-7421)] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400",
            )}
          >
            {option.label}
            <span className={clsx("ml-1.5 tabular-nums", active ? "text-white/85" : "text-gray-500")}>
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
