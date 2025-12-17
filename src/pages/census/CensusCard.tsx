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
  // Usamos 'is_active' para determinar si el censo está "Activo" o "Inactivo"
  const status = census.is_active ? "Activo" : "Inactivo"; 
  const statusColor = census.is_active ? "bg-green-500" : "bg-gray-400"; // Color según el estado

  const year = census.init_date ? new Date(census.init_date).getFullYear() : "2024";
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
          bg-[#F9F7F0]
          text-[#4A4A4A]
          px-5 py-4
          flex justify-between items-start
          border-b border-[#E0D9C3]
        "
      >
        <div className="text-sm font-semibold leading-snug tracking-wide">
          {census.name}
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 flex-1 flex flex-col gap-4">
        {/* Estado y Año */}
        <div className="flex items-center gap-2">
          <span
            className={`
              inline-flex items-center px-3 py-0.5 rounded-full
              text-[11px] font-medium
              ${statusColor} text-white
            `}
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

        {/* Fechas */}
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

        {/* Botón de acción (mejorado) */}
        <button
          type="button"
          onClick={() => onView(census)}
          className="
            px-4 py-2 rounded-xl text-sm font-medium
            bg-[#7C1227] text-white
            hover:bg-[#5a0e1a] focus:outline-none focus:ring-2 focus:ring-[#7C1227] focus:ring-opacity-50
            transition-all duration-300
          "
        >
          Ver censo
        </button>
      </div>
    </div>
  );
}
