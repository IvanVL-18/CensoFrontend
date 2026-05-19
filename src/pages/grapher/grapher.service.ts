import api from "../../lib/Axios";
import type { ChartApiData } from "./components/charts";

export async function getChartData(): Promise<ChartApiData> {
  const { data } = await api.get<ChartApiData>("/chart-data");
  return data;
}
