import type { LucideIcon } from "lucide-react";
import { Eye } from "lucide-react";
import type { StatCardColor } from "../dashboard.types";

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: StatCardColor;
  onAction?: () => void;
};

const COLOR_MAP: Record<
  StatCardColor,
  { ring: string; accent: string; soft: string }
> = {
  blue: { ring: "ring-blue-200", accent: "text-blue-700", soft: "bg-blue-50" },
  green: { ring: "ring-green-200", accent: "text-green-700", soft: "bg-green-50" },
  cyan: { ring: "ring-cyan-200", accent: "text-cyan-700", soft: "bg-cyan-50" },
};

export default function StatCard({ title, value, icon: Icon, color, onAction }: Props) {
  const c = COLOR_MAP[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-10 w-10 rounded-xl ${c.soft} ring-1 ${c.ring} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${c.accent}`} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="h-9 w-9 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-center"
          title="Ver detalle"
        >
          <Eye className="h-4 w-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
