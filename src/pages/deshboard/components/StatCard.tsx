import { Eye } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string;
  icon?: ReactNode;
  onView?: () => void;
};

export default function StatCard({ title, value, icon, onView }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center">
          {icon}
        </div>

        <div className="leading-tight">
          <p className="text-xs text-slate-500 font-semibold uppercase">
            {title}
          </p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onView}
        className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
        title="Ver"
      >
        <Eye className="h-4 w-4 text-slate-500" />
      </button>
    </div>
  );
}
