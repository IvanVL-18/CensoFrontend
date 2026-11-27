import api from "../../lib/Axios";
import type { ChartApiData } from "./components/charts";

/** Módulos de un censo. Sin `census` grafica el más reciente; el id es el cifrado que trae `censuses`. */
export async function getChartData(census?: string): Promise<ChartApiData | null> {
  const { data } = await api.get("/chart-data", { params: census ? { census } : undefined });
  if (Array.isArray(data?.data) && data.data.length === 0) return null;
  return data as ChartApiData;
}
