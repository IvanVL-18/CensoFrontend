import ChartPlaceholder from "./ChartPlaceholder";

type Props = {
  title: string;
  centralizedCount: number;
  totalInstitutions: number;
};

export default function ChartsCard({
  title,
  centralizedCount,
  totalInstitutions,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#7A0C2E] px-4 py-4 sm:py-5.5">
        <h2 className="text-white font-semibold text-base">{title}</h2>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Instituciones
        </h3>
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
    </div>
  );
}
