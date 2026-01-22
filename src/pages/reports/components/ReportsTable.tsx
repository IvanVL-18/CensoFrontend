import ReportRow from "./ReportRow";
import type { ReportItem } from "../ReportsPage";

type Props = {
  items: ReportItem[];
};

export default function ReportsTable({ items }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Wrapper para permitir scroll horizontal en móvil si hace falta */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
            <div>Nombre del censo</div>
            <div className="text-right">Descargar</div>
          </div>

          {/* Body */}
          <div className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                No hay resultados
              </div>
            ) : (
              items.map((item) => <ReportRow key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
