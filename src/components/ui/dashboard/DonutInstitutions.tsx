import React, { memo, useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

export type DonutPoint = { name: string; value: number };

type Props = {
  data: DonutPoint[];             // ⬅️ vendrá de tu API
  colors?: string[];              // default tonos azules
  height?: number | string;       // default 256
  innerRadius?: number;           // default 70
  outerRadius?: number;           // default 95
};

function DonutInstitutionsBase({
  data,
  colors = ["#5F71E2", "#E6E8F6"],
  height = 256,
  innerRadius = 70,
  outerRadius = 95,
}: Props) {
  const safe = useMemo(() => data ?? [], [data]);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={safe}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={1}
            dataKey="value"
            nameKey="name"
          >
            {safe.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-sm text-neutral-600 text-center -mt-6">
        Tipo de Instituciones
      </div>
    </div>
  );
}

export default memo(
  DonutInstitutionsBase,
  (a, b) =>
    a.height === b.height &&
    a.innerRadius === b.innerRadius &&
    a.outerRadius === b.outerRadius &&
    a.colors === b.colors &&
    a.data === b.data // ⬅️ misma referencia = no re-render
);
