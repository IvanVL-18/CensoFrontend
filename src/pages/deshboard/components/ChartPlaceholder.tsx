import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type DonutItem = { label: string; value: number };
type BarItem = { label: string; value: number | string };

type Props =
  | { kind: "donut"; donutData: DonutItem[] }
  | { kind: "bar"; barData: BarItem[] };

const DONUT_COLORS = ["#7C1227", "#E2D9CC"];

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-[#3b2a2e] mb-0.5">{name}</p>
      <p className="text-[#7b6670] font-bold text-[#4b1220]">{value}</p>
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-[#3b2a2e] mb-1 max-w-[160px] leading-snug">
        {label}
      </p>
      <p className="text-[#7b6670]">
        <span className="font-bold text-[#4b1220]">{payload[0].value}</span>{" "}
        preguntas
      </p>
    </div>
  );
}

export default function ChartPlaceholder(props: Props) {
  if (props.kind === "donut") {
    const data = props.donutData.map((d) => ({
      name: d.label,
      value: Number(d.value ?? 0),
    }));
    const total = data.reduce((a, b) => a + b.value, 0) || 1;

    return (
      <div className="flex flex-col-reverse sm:flex-row items-center gap-5">
        {/* Leyenda */}
        <div className="w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
          {data.map((d, idx) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div
                key={d.name}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-[#F5F1EA]/60 border border-black/5"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: DONUT_COLORS[idx] ?? "#CBD5E1" }}
                />
                <span className="flex-1 text-xs text-slate-700 truncate">
                  {d.name}
                </span>
                <span className="text-xs font-semibold text-[#4b1220]">
                  {d.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Dona */}
        <div className="flex-1 flex justify-center">
          <div className="w-36 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="82%"
                  paddingAngle={0}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={700}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index] ?? "#E2D9CC"}
                      stroke="white"
                      strokeWidth={3}
                      style={{ outline: "none" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  const clean = props.barData.map((b) => ({
    name: String(b.label ?? ""),
    value: Number(b.value ?? 0),
  }));

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={clean}
          margin={{ top: 8, right: 8, left: 0, bottom: 64 }}
          barCategoryGap="40%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            angle={-40}
            textAnchor="end"
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            width={28}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "#F5F1EA" }} />
          <Bar
            dataKey="value"
            fill="#7C1227"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
