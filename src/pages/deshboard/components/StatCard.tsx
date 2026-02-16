import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  title: string;
  value: string; 
  icon: React.ReactNode;
  defaultHidden?: boolean; 
};

export default function StatCard({
  title,
  value,
  icon,
  defaultHidden = true,
}: Props) {
  const [show, setShow] = useState(!defaultHidden);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-[11px] tracking-wider text-slate-500 font-semibold">
            {title}
          </p>

          <p className="text-lg font-bold text-slate-900 leading-6">
            {show ? value : "••••"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="h-9 w-9 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white transition flex items-center justify-center"
        title={show ? "Ocultar" : "Mostrar"}
      >
        {show ? (
          <Eye className="h-4 w-4 text-slate-500" />
        ) : (
          <EyeOff className="h-4 w-4 text-slate-500" />
        )}
      </button>
    </div>
  );
}
