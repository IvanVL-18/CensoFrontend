import type { DonutItem, BarItem } from "../dashboard.types";

type Props =
  | { kind: "donut"; donutData: DonutItem[] }
  | { kind: "bar"; barData: BarItem[] };

export default function ChartPlaceholder(props: Props) {
  if (props.kind === "donut") {
    const total = props.donutData.reduce((a, b) => a + b.value, 0) || 1;

    const first = props.donutData[0]?.value ?? 70;
    const a = Math.round((first / total) * 100);

    const style: React.CSSProperties = {
      background: `conic-gradient(#6F7BD9 0% ${a}%, #E7E9F8 ${a}% 100%)`,
    };

    return (
      <div className="flex items-start gap-4">
        <div className="min-w-[170px]">
          {props.donutData.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <span className="h-3 w-3 rounded-sm bg-[#6F7BD9]" />
              <span className="truncate">{d.label}</span>
              <span className="ml-auto text-slate-500">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full" style={style} />
            <div className="absolute inset-5 rounded-full bg-white shadow-inner" />
          </div>
        </div>
      </div>
    );
  }

  const max = Math.max(...props.barData.map((b) => b.value), 1);

  return (
    <div className="w-full">
      <div className="h-[220px] border border-slate-200 rounded-xl p-3">
        <div className="h-full flex items-end gap-4">
          {props.barData.map((b) => {
            const h = Math.round((b.value / max) * 100);
            return (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg"
                  style={{ height: `${h}%`, background: "#B08B57" }}
                  title={`${b.value}`}
                />
                <p className="text-[10px] text-slate-600 text-center leading-3 line-clamp-2">
                  {b.label}
                </p>
              </div>
            );
          })}
        </div>
      </div> 
    </div>
  );
}
