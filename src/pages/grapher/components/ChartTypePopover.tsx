import { PieChart, BarChart3, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

type ChartKind = "general" | "cuestionario";

const OPTIONS: Array<{ key: ChartKind; label: string; Icon: any }> = [
  { key: "general", label: "General", Icon: PieChart },
  { key: "cuestionario", label: "Cuestionario", Icon: BarChart3 },
];

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export default function ChartTypePopover({ className, onNavigate }: Props) {
  const navigate = useNavigate();

  const go = (k: ChartKind) => {
    onNavigate?.();
    // Puedes usar query param o ruta dinámica, aquí uso query:
    navigate(`/graficador?tipo=${k}`);
  };

  return (
    <div
      role="menu"
      className={clsx(
        "w-44 rounded-xl border border-black/5 bg-[#F5F1EA] shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Header del popover */}
      <div className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#5F0F1B]/80 border-b border-black/5">
        <ChevronLeft className="size-3.5 opacity-60" />
        <span className="font-semibold">Tipos de gráfica</span>
      </div>

      {/* Lista de opciones */}
      <div className="py-1">
        {OPTIONS.map(({ key, label, Icon }) => (
          <button
            key={key}
            role="menuitem"
            onClick={() => go(key)}
            className={clsx(
              "flex w-full items-center gap-3 px-3 py-2 text-left text-[13px] rounded-md",
              "hover:bg-[#DCCDB3] focus:bg-[#DCCDB3] transition"
            )}
          >
            <Icon className="size-4 text-[#5F0F1B]" />
            <span className="text-[#3b2a2e]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
