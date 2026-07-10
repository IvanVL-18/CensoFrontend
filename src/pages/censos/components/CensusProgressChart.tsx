import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Props = {
  percentage: number;
  totalExpected: number;
  totalCompleted: number;
};

function CenterLabel({ percentage }: { percentage: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan
        x="50%"
        dy="-4"
        className="fill-[#691b31]"
        fontSize={22}
        fontWeight={700}
      >
        {percentage}%
      </tspan>
      <tspan x="50%" dy={18} className="fill-gray-400" fontSize={10}>
        completado
      </tspan>
    </text>
  );
}

export function CensusProgressChart({
  percentage,
  totalExpected,
  totalCompleted,
}: Props) {
  const data = [
    { name: "Completado", value: percentage, color: "#691b31" },
    {
      name: "Pendiente",
      value: Math.max(0, 100 - percentage),
      color: "#DDC9A3",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="shrink-0 w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart style={{ outline: "none" }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              animationDuration={700}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  style={{ outline: "none" }}
                />
              ))}
            </Pie>
            <CenterLabel percentage={percentage} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-1 gap-4 w-full">
        <div className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-[#691b31]">{totalExpected}</p>
          <p className="text-xs text-gray-500 mt-1">Esperados</p>
        </div>
        <div className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-[#C3A67C]">{totalCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Completados</p>
        </div>
      </div>
    </div>
  );
}
