type Props = {
  title: string;
  centralized: number;
  decentralized: number;
  questionsByCenso?: { name: string; total: number }[];
};

export default function ChartsCard({
  title,
  centralized,
  decentralized,
}: Props) {
  const total = centralized + decentralized;
  const pctCentral = total ? Math.round((centralized / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#7A0C2E] px-4 py-3">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>

      <div className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">
          Tipo de Instituciones
        </h3>

        <div className="flex items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="h-3 w-3 rounded bg-indigo-500 inline-block" />
              <span>Centralizadas</span>
              <span className="ml-6 text-slate-500">{centralized}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="h-3 w-3 rounded bg-indigo-300 inline-block" />
              <span>Descentralizadas</span>
              <span className="ml-6 text-slate-500">{decentralized}</span>
            </div>
          </div>

          <div className="ml-auto">
            <div
              className="relative h-40 w-40 rounded-full"
              style={{
                background: `conic-gradient(#6366F1 0 ${pctCentral}%, #C7D2FE ${pctCentral}% 100%)`,
              }}
            >
              <div className="absolute inset-5 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
