// src/pages/census/components/CensusCard.tsx
import { MoreVertical } from "lucide-react";

export interface Census {
  id: number | string;
  name: string;

  status?: string;
  year?: string | number;
  start_date?: string;
  end_date?: string;
  [key: string]: any;
}

type Props = {
  census: Census;
  onView: (census: Census) => void;
};

export default function CensusCard({ census, onView }: Props) {
  const status = census.status ?? "Creado";
  const year = census.year ?? "2024";
  const startDate = census.start_date ?? "---";
  const endDate = census.end_date ?? "---";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      {/* Header rojo */}
      <div className="bg-[var(--pantone-7421)] text-white px-4 py-3 flex justify-between items-start">
        <div className="text-sm font-semibold leading-snug line-clamp-2">
          {census.name}
        </div>
        <span className="w-3 h-3 rounded-full bg-emerald-500 ml-2 mt-1" />
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 flex-1 flex flex-col gap-3">
        {/* Chips estado/año */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
            {status}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-800 text-gray-100">
            {year}
          </span>
        </div>

        {/* Fechas */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between text-xs text-gray-600">
          <div>
            <div className="font-medium text-gray-700">Inicio</div>
            <div>{startDate}</div>
          </div>
          <div className="border-l border-gray-300 h-8 mx-4" />
          <div>
            <div className="font-medium text-gray-700">Fin</div>
            <div>{endDate}</div>
          </div>
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Botón inferior */}
        <button
          type="button"
          onClick={() => onView(census)}
          className="mt-2 inline-flex items-center justify-center w-full rounded-lg bg-[#d7b46a] text-[13px] font-medium text-white py-2 hover:bg-[#c29f52] transition-colors"
        >
          Ver censo
        </button>
      </div>
    </div>
  );
}
