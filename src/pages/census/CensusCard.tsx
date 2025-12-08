import type { Census } from "./censos.service";

type Props = {
  census: Census;
  onView: (census: Census) => void;
};

function formatDate(value: string | null): string {
  if (!value) return "---";

  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CensusCard({ census, onView }: Props) {
  const status = "Creado";
  const year = census.init_date
    ? new Date(census.init_date).getFullYear()
    : "2024";

  const startDate = formatDate(census.init_date);
  const endDate = formatDate(census.deadline);

  return (
    <div
      className="
        bg-[#FAF7F2]
        rounded-2xl
        border border-[#E6DFD3]
        shadow-[0_6px_16px_rgba(0,0,0,0.06)]
        overflow-hidden
        flex flex-col
        transition-all duration-300
        hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]
        hover:-translate-y-[2px]
      "
    >
      <div
        className="
          bg-gradient-to-r 
          from-[var(--pantone-7421)] 
          to-[#4B0F21]
          text-white
          px-5 py-4
          flex justify-between items-start
          border-b border-white/10
        "
      >
        <div className="text-sm font-semibold leading-snug tracking-wide">
          {census.name}
        </div>

        <span className="mt-1">
          <span className="w-2.5 h-2.5 block rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
        </span>
      </div>

      <div className="px-5 pt-4 pb-5 flex-1 flex flex-col gap-4">
        
        <div className="flex items-center gap-2">
          <span
            className="
              inline-flex items-center px-3 py-0.5 rounded-full
              text-[11px] font-medium
              bg-emerald-50 text-emerald-700
              border border-emerald-100
            "
          >
            {status}
          </span>

          <span
            className="
              inline-flex items-center px-3 py-0.5 rounded-full
              text-[11px] font-medium
              bg-neutral-900 text-neutral-100
            "
          >
            {year}
          </span>
        </div>

        <div
          className="
            bg-white
            rounded-xl
            border border-[#E5DDD0]
            px-4 py-3
            flex items-center justify-between
            text-[12px] text-neutral-600
          "
        >
          <div>
            <div className="font-semibold text-neutral-800">Inicio</div>
            <div className="mt-[2px] tabular-nums">{startDate}</div>
          </div>

          <div className="h-9 mx-5 border-l border-[#D7CDC2]" />

          <div className="text-right">
            <div className="font-semibold text-neutral-800">Fin</div>
            <div className="mt-[2px] tabular-nums">{endDate}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onView(census)}
          className="
            px-4 py-2 rounded-xl text-sm font-medium
            border border-gray-300 text-gray-700 bg-white
            hover:bg-[#D7CDC2]/30 transition-colors
            "
        >
          Ver censo
        </button>
      </div>
    </div>
  );
}
