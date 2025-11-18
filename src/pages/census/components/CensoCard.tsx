import { MoreVertical } from "lucide-react";

export type Censo = {
  id: number;
  name: string;
  year: number;
  status: "Creado" | "En curso" | "Cerrado";
  startDate: string; 
  endDate: string;
  active: boolean;
};

export default function CensoCard({ censo, onView }: { censo: Censo; onView: (id: number) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-md overflow-hidden bg-white">
      {/* Encabezado vino con punto de estado */}
      <div className="bg-[#691B31] h-10 relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
          style={{ backgroundColor: censo.active ? "#27C93F" : "#D1D5DB" }}
        />
      </div>

      <div className="p-4 pb-3">
        <h4 className="font-semibold text-gray-900 leading-snug">{censo.name}</h4>
      </div>

      {/* Chips estado/año + kebab */}
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              {censo.status}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">
              {censo.year}
            </span>
          </div>
          <button className="h-8 w-8 grid place-items-center rounded-md text-gray-500 hover:bg-gray-100">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Fechas */}
      <div className="px-4 mt-3">
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200">
          <div className="px-3 py-2">
            <div className="text-[11px] text-gray-500">Inicio</div>
            <div className="text-sm text-gray-800">{censo.startDate}</div>
          </div>
          <div className="px-3 py-2 border-l border-gray-200">
            <div className="text-[11px] text-gray-500">Fin</div>
            <div className="text-sm text-gray-800">{censo.endDate}</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4">
        <button
          onClick={() => onView(censo.id)}
          className="w-full h-9 rounded-md text-white bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B] shadow hover:brightness-95"
        >
          Ver Censo
        </button>
      </div>
    </div>
  ); 
}
