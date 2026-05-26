import api from "../../lib/Axios";
import type { ChartApiData } from "./components/charts";

export async function getChartData(): Promise<ChartApiData | null> {
  const { data } = await api.get("/chart-data");
  if (Array.isArray(data?.data) && data.data.length === 0) return null;
  return data as ChartApiData;
}
