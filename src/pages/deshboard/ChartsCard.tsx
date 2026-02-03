import ChartPlaceholder from "./ChartPlaceholder";
import type { DonutItem, BarItem } from "./dashboard.types";

type Props = {
  title: string;
  donutTitle: string;
  donutData: DonutItem[];
  barTitle: string;
  barData: BarItem[];
};

export default function ChartsCard({
  title,
  donutTitle,
  donutData,
  barTitle,
  barData,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#7A0C2E] px-4 py-5">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-800">{donutTitle}</p>
          <div className="mt-3">
            <ChartPlaceholder kind="donut" donutData={donutData} />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">{barTitle}</p>
          <div className="mt-3">
            <ChartPlaceholder kind="bar" barData={barData} />
          </div>
        </div>
      </div>
    </div>
  );
}
