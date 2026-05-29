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

const DONUT_COLORS = ["#7C1227", "#CBD5E1"];
const BAR_COLOR = "#7C1227";

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
      <p className="text-[#7b6670]">
        <span className="font-bold text-[#4b1220]">{value}</span>
      </p>
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
      <p className="font-semibold text-[#3b2a2e] mb-1">{label}</p>
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

    return (
      <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start gap-6 sm:gap-4">
        {/* Leyenda */}
        <div className="w-full sm:w-auto min-w-[170px]">
          {data.map((d, idx) => (
            <div
              key={d.name}
              className="flex items-center gap-2 text-sm mb-2 rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-sm border border-black/10"
                style={{ backgroundColor: DONUT_COLORS[idx] ?? "#CBD5E1" }}
              />
              <span className="truncate text-slate-700">{d.name}</span>
              <span className="ml-auto text-slate-500 font-medium">
                {d.value}
              </span>
            </div>
          ))}
        </div>

        {/* Dona */}
        <div className="flex-1 flex justify-center">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={0}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={700}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index] ?? "#CBD5E1"}
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
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={clean} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "#f5f1ea" }} />
          <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
