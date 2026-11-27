import { useEffect, useRef, useState } from "react";
import { BarChart3, Loader2, AlertCircle, FileDown } from "lucide-react";
import GeneralCharts from "../components/GeneralCharts";
import type { ChartApiData } from "../components/charts";
import { getChartData } from "../grapher.service";
import { exportModulesPdf } from "../utils/pdfExport";

export default function ChartsPage() {
  const [chartData, setChartData] = useState<ChartApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  /** Id cifrado del censo elegido; sin elegir, el backend da el más reciente. */
  const [censusId, setCensusId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getChartData(censusId)
      .then(setChartData)
      .catch(() => setError("No se pudieron obtener los datos de las gráficas."))
      .finally(() => setLoading(false));
  }, [censusId]);

  const censuses = chartData?.censuses ?? [];

  async function handleExportPdf() {
    if (exporting || !chartData || !chartRef.current) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportModulesPdf({
        chartElement: chartRef.current,
        censusName: chartData.census.name,
        modules: chartData.modules,
      });
    } catch {
      setExportError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  const canExport = !!chartData && !loading && !error;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F5F1EA] border border-black/5 shadow-sm px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C1227] shadow-sm">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-[#7C1227]/60 font-medium uppercase tracking-wide leading-none mb-0.5">
              Graficador
            </p>
            <h2 className="text-sm font-semibold text-[#4b1220] leading-none">
              Módulos del censo
            </h2>
          </div>
        </div>

        {censuses.length > 1 && (
          <label className="ml-auto flex min-w-0 items-center gap-2 text-sm text-[#4b1220]">
            <span className="hidden shrink-0 sm:inline">Censo</span>
            <select
              value={censuses.find((census) => census.selected)?.name ?? ""}
              onChange={(event) => setCensusId(censuses.find((census) => census.name === event.target.value)?.id)}
              disabled={loading}
              className="max-w-[18rem] truncate rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm focus:border-[#7C1227] focus:outline-none"
            >
              {censuses.map((census) => (
                <option key={census.name} value={census.name}>
                  {census.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={!canExport || exporting}
          title="Descargar PDF del informe"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-all duration-200 shrink-0
            ${
              canExport && !exporting
                ? "bg-[#7C1227] text-white border-[#7C1227] hover:bg-[#9a1530] active:scale-95 shadow-sm"
                : "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
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
