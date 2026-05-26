import { useEffect, useRef, useState } from "react";
import { BarChart3, BookOpen, Loader2, AlertCircle, FileDown } from "lucide-react";
import GeneralCharts from "../components/GeneralCharts";
import QuestionnaireCharts, {
  QUESTIONNAIRES,
} from "../components/QuestionnaireCharts";
import type { ChartKind, ChartApiData } from "../components/charts";
import { getChartData } from "../grapher.service";
import {
  exportModulesPdf,
  exportCensosPdf,
} from "../utils/pdfExport";

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
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Estado del cuestionario seleccionado (pestaña censos)
  const [selectedCensoId, setSelectedCensoId] = useState<string>(
    QUESTIONNAIRES[0]?.id ?? ""
  );

  // Ref al contenedor de la gráfica activa para html2canvas
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active !== "modulos") return;
    setLoading(true);
    setError(null);
    getChartData()
      .then(setChartData)
      .catch(() => setError("No se pudieron obtener los datos de las gráficas."))
      .finally(() => setLoading(false));
  }, [active]);

  async function handleExportPdf() {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      if (active === "modulos") {
        if (!chartData || !chartRef.current) return;
        await exportModulesPdf({
          chartElement: chartRef.current,
          censusName: chartData.census.name,
          modules: chartData.modules,
        });
      } else {
        const selected =
          QUESTIONNAIRES.find((q) => q.id === selectedCensoId) ??
          QUESTIONNAIRES[0];
        await exportCensosPdf({
          censusName: selected.name,
          totalQuestions: selected.totalQuestions,
          resolvedQuestions: selected.resolvedQuestions,
        });
      }
    } catch {
      setExportError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  const canExport =
    active === "censos" ||
    (active === "modulos" && !!chartData && !loading && !error);

  return (
    <div className="space-y-4">
      {/* Barra de tabs + botón PDF */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5 rounded-xl bg-[#F5F1EA] p-1 border border-black/5 shadow-sm">
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

        {/* Botón Descargar PDF */}
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={!canExport || exporting}
          title="Descargar PDF del informe"
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm border transition-all duration-200 shrink-0
            ${
              canExport && !exporting
                ? "bg-[#7C1227] text-white border-[#7C1227] hover:bg-[#9a1530] active:scale-95"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
        >
          {exporting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileDown size={15} />
          )}
          <span className="hidden sm:inline">
            {exporting ? "Generando..." : "Descargar PDF"}
          </span>
        </button>
      </div>

      {/* Error de exportación */}
      {exportError && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm flex-1">{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Contenido */}
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
              <div ref={chartRef}>
                <GeneralCharts
                  modules={chartData.modules}
                  censusName={chartData.census.name}
                />
              </div>
            )}
            {!loading && !error && !chartData && (
              <p className="text-sm text-gray-400 text-center py-10">
                Sin datos disponibles.
              </p>
            )}
          </>
        )}

        {active === "censos" && (
          <QuestionnaireCharts
            selectedId={selectedCensoId}
            onSelectChange={setSelectedCensoId}
          />
        )}
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
