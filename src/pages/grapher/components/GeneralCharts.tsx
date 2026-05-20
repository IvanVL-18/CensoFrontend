import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatModulesForPie, calcTotal } from "../utils/chartUtils";
import type { CensusModuleItem } from "./charts";

type Props = {
  modules: CensusModuleItem[];
  censusName: string;
};

type PieSlice = {
  name: string;
  value: number;
  color: string;
};

type TooltipPayloadItem = {
  payload: PieSlice;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 shadow-md text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="font-semibold text-[#3b2a2e]">{name}</span>
      </div>
      <p className="text-[#7b6670]">
        <span className="font-bold text-[#4b1220]">{value}</span> preguntas
      </p>
    </div>
  );
}

function CenterLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-8" className="fill-[#4b1220]" fontSize={22} fontWeight={700}>
        {total}
      </tspan>
      <tspan x="50%" dy={20} className="fill-[#7b6670]" fontSize={11}>
        preguntas
      </tspan>
    </text>
  );
}

export default function GeneralCharts({ modules, censusName }: Props) {
  const data: PieSlice[] = formatModulesForPie(modules);
  const total: number = calcTotal(modules);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-1 border-b border-gray-200 pb-3">
        <h2 className="text-base sm:text-lg font-semibold text-[#4b1220]">
          {censusName}
        </h2>
        <p className="text-xs text-[#7b6670]">
          {modules.length} {modules.length === 1 ? "módulo" : "módulos"} ·{" "}
          {total} preguntas en total
        </p>
      </header>

      {modules.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          No hay módulos para mostrar.
        </p>
      ) : (
        <article className="rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          <div className="bg-[#7C1227] text-white px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold">
              Distribución de preguntas por módulo
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
              {total} preguntas
            </span>
          </div>

          <div className="p-6 flex flex-col lg:flex-row items-center gap-10">
            {/* Donut Chart */}
            <div className="shrink-0 w-56 h-56 sm:w-64 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={700}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" style={{ outline: "none" }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <CenterLabel total={total} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda */}
            <div className="flex flex-col gap-1.5 w-full">
              {data.map((entry, index) => {
                const percent = total > 0 ? (entry.value / total) * 100 : 0;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#F5F1EA] transition-colors"
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="flex-1 text-xs text-[#3b2a2e] truncate">
                      {entry.name}
                    </span>
                    <div className="shrink-0 flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-[#4b1220]">
                        {entry.value}
                      </span>
                      <span className="text-[11px] text-[#7b6670]">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
