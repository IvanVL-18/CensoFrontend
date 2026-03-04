import ChartPlaceholder from "./ChartPlaceholder";

type Props = {
  title: string;
  centralizedCount: number;
  totalInstitutions: number;
  questionsByCenso: { name: string; total: number }[];
};

export default function ChartsCard({
  title,
  centralizedCount,
  totalInstitutions,
  questionsByCenso,
}: Props) {
  const barMinWidth = Math.max((questionsByCenso?.length ?? 0) * 140, 600);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#7A0C2E] px-4 py-5.5">
        <h2 className="text-white font-semibold text-base">{title}</h2>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">
              Instituciones
            </h3>
          </div>

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

        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Preguntas por censo
          </h3>
          <div className="w-full overflow-x-auto pb-2">
            <div style={{ minWidth: barMinWidth }}>
              <ChartPlaceholder
                kind="bar"
                barData={(questionsByCenso ?? []).map((x) => ({
                  label: x.name,
                  value: x.total,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}