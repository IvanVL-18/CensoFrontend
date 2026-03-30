import React from "react";

type DonutItem = { label: string; value: number };
type BarItem = { label: string; value: number | string };

type Props =
  | { kind: "donut"; donutData: DonutItem[] }
  | { kind: "bar"; barData: BarItem[] };

export default function ChartPlaceholder(props: Props) {
  if (props.kind === "donut") {
    const colors = ["#6F7BD9", "#E7E9F8"];
    const activeColors = ["#4F5BE6", "#CBD5E1"];
    const values = props.donutData.map((d) => Number(d.value ?? 0));
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const firstPct = Math.round(((values[0] ?? 0) / total) * 100);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const donutStyle: React.CSSProperties = {
      background:
        activeIndex === null
          ? `conic-gradient(${colors[0]} 0% ${firstPct}%, ${colors[1]} ${firstPct}% 100%)`
          : activeIndex === 0
            ? `conic-gradient(${activeColors[0]} 0% ${firstPct}%, #F1F5F9 ${firstPct}% 100%)`
            : `conic-gradient(#F1F5F9 0% ${firstPct}%, ${activeColors[1]} ${firstPct}% 100%)`,
    };

    return (
      <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start gap-6 sm:gap-4">
        <div className="w-full sm:w-auto min-w-[170px]">
          {props.donutData.map((d, idx) => {
            const isActive = activeIndex === idx;
            const isDimmed = activeIndex !== null && !isActive;

            const chipColor =
              activeIndex === null
                ? (colors[idx] ?? "#CBD5E1")
                : isActive
                  ? (activeColors[idx] ?? colors[idx])
                  : "#E2E8F0";

            return (
              <button
                key={d.label}
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev === idx ? null : idx))
                }
                className={`
                w-full text-left
                flex items-center gap-2 text-sm mb-2
                rounded-lg px-2 py-1
                transition
                ${isActive ? "bg-slate-50 ring-1 ring-slate-200" : "hover:bg-slate-50"}
              `}
                title="Click para resaltar"
              >
                <span
                  className="h-3 w-3 rounded-sm transition"
                  style={{ backgroundColor: chipColor }}
                />
                <span
                  className={`truncate ${isDimmed ? "text-slate-400" : "text-slate-700"}`}
                >
                  {d.label}
                </span>
                <span
                  className={`ml-auto ${isDimmed ? "text-slate-300" : "text-slate-500"}`}
                >
                  {Number(d.value ?? 0)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative h-40 w-40">
            <div
              className="absolute inset-0 rounded-full transition"
              style={donutStyle}
            />
            <div className="absolute inset-5 rounded-full bg-white shadow-inner" />
          </div>
        </div>
      </div>
    );
  }

  const clean = props.barData.map((b) => ({
    label: String(b.label ?? ""),
    value: Number((b as any).value ?? 0),
  }));

  const max = Math.max(...clean.map((b) => b.value), 1);

  return (
    <div className="w-full">
      <div className="h-[260px] border border-slate-200 rounded-xl p-6">
        <div className="relative h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-slate-100"
              style={{ bottom: `${(i * 100) / 4}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end justify-around gap-6">
            {clean.map((b) => {
              const height = Math.round((b.value / max) * 100);

              return (
                <div key={b.label} className="flex flex-col items-center gap-2">
                  <div className="relative group w-[64px]">
                    <div
                      className="
                        pointer-events-none
                        absolute -top-10 left-1/2 -translate-x-1/2
                        opacity-0 group-hover:opacity-100
                        transition
                      "
                    >
                      <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                        {b.value} preguntas
                      </div>
                      <div className="mx-auto w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-slate-900" />
                    </div>
                    <div
                      className="w-full rounded-md"
                      style={{
                        height: `${height}%`,
                        minHeight: b.value > 0 ? "12px" : "0px",
                        backgroundColor: "#B08B57",
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 text-center leading-tight max-w-[90px] line-clamp-2">
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
