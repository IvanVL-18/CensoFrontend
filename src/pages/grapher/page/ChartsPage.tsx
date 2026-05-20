import { useEffect, useState } from "react";
import { BarChart3, BookOpen, Loader2, AlertCircle } from "lucide-react";
import GeneralCharts from "../components/GeneralCharts";
import QuestionnaireCharts from "../components/QuestionnaireCharts";
import type { ChartKind, ChartApiData } from "../components/charts";
import { getChartData } from "../grapher.service";

const TABS: Array<{ kind: ChartKind; label: string; Icon: React.ElementType }> =
  [
    { kind: "modulos", label: "Módulos del censo", Icon: BarChart3 },
    { kind: "censos", label: "Censos", Icon: BookOpen },
  ];

export default function ChartsPage() {
  const [active, setActive] = useState<ChartKind>("modulos");
  const [chartData, setChartData] = useState<ChartApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (active !== "modulos") return;
    setLoading(true);
    setError(null);
    getChartData()
      .then(setChartData)
      .catch(() => setError("No se pudieron obtener los datos de las gráficas."))
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div className="space-y-4">
      {/* Tabs inline */}
      <div className="flex gap-1.5 rounded-xl bg-[#F5F1EA] p-1 border border-black/5 shadow-sm">
        {TABS.map(({ kind, label, Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => setActive(kind)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              active === kind
                ? "bg-[#7C1227] text-white shadow-sm"
                : "text-[#4b1220] hover:bg-[#e8dece]"
            }`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-black/5 p-4 sm:p-6 shadow-sm">
        {active === "modulos" && (
          <>
            {loading && <ChartsSkeleton />}
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {!loading && !error && chartData && (
              <GeneralCharts
                modules={chartData.modules}
                censusName={chartData.census.name}
              />
            )}
            {!loading && !error && !chartData && (
              <p className="text-sm text-gray-400 text-center py-10">
                Sin datos disponibles.
              </p>
            )}
          </>
        )}

        {active === "censos" && <QuestionnaireCharts />}
      </div>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Cargando datos...</span>
    </div>
  );
}
