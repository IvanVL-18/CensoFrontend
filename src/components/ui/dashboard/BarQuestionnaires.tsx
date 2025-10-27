import React, { memo, useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";

export type BarPoint = { name: string; total: number };

type Props = {
  data: BarPoint[];              // ⬅️ vendrá de tu API
  height?: number | string;      // default 256
  color?: string;                // default "#C9A54C"
  animate?: boolean;             // default true
};

function BarQuestionnairesBase({
  data,
  height = 256,
  color = "#C9A54C",
  animate = true,
}: Props) {
  const safeData = useMemo(() => data ?? [], [data]);
  const tickStyle = useMemo(() => ({ fontSize: 12 }), []);
  const tooltipStyle = useMemo(
    () => ({ fontSize: 12, borderRadius: 8 } as React.CSSProperties),
    []
  );

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={safeData}
          barSize={30}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke="#eee" vertical={false} />
          <XAxis dataKey="name" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="total"
            fill={color}
            radius={[6, 6, 0, 0]}
            isAnimationActive={animate}
            animationDuration={300}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-sm text-neutral-600 text-center -mt-2">
        Cuestionarios (Total de Preguntas)
      </div>
    </div>
  );
}

// 🔒 Evita re-render si props superficiales no cambian
export default memo(
  BarQuestionnairesBase,
  (prev, next) =>
    prev.height === next.height &&
    prev.color === next.color &&
    prev.animate === next.animate &&
    prev.data === next.data // ⬅️ usa la misma referencia al venir de SWR/React Query/useMemo en el padre
);
