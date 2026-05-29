import { PieChart, BarChart2 } from "lucide-react";
import ChartPlaceholder from "./ChartPlaceholder";

type Props = {
  title: string;
  centralizedCount: number;
  totalInstitutions: number;
  questionsByCenso: { name: string; total: number }[];
};

export default function ChartsCard({
  title,
  centralizedCount,
  totalInstitutions,
  questionsByCenso,
}: Props) {
  const barMinWidth = Math.max((questionsByCenso?.length ?? 0) * 140, 600);

  return (
    <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#F5F1EA] border-b border-black/5 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C1227] shadow-sm shrink-0">
          <BarChart2 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7C1227]/60 leading-none mb-0.5">
            Resumen
          </p>
          <h2 className="text-sm font-semibold text-[#4b1220] leading-none">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Sección dona */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={15} className="text-[#7C1227]" />
            <span className="text-sm font-semibold text-[#4b1220]">
              Distribución de instituciones
            </span>
          </div>
          <ChartPlaceholder
            kind="donut"
            donutData={[
              { label: "Centralizadas", value: centralizedCount },
              {
                label: "Otras",
                value: Math.max(totalInstitutions - centralizedCount, 0),
              },
            ]}
          />
        </div>

        <div className="border-t border-gray-100" />

        {/* Sección barras */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-[#7C1227]" />
            <span className="text-sm font-semibold text-[#4b1220]">
              Preguntas por censo
            </span>
          </div>
          <div className="w-full overflow-x-auto pb-2">
            <div style={{ minWidth: barMinWidth }}>
              <ChartPlaceholder
                kind="bar"
                barData={(questionsByCenso ?? []).map((x) => ({
                  label: x.name,
                  value: x.total,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
