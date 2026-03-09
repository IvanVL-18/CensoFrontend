import api from "../../lib/Axios";
import type {
  Censo,
  PaginatedCensosResponse,
 
} from "./CUser.types";

import type {

} from "./CUser.types";

export type CensoFilter = "all" | "active" | "inactive";
type CensoId = string | number;

export const getCensos = async (
  filter: CensoFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",
  direction: "asc" | "desc" = "asc",
  signal?: AbortSignal,
): Promise<PaginatedCensosResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedCensosResponse>(
    `/censos/${filter}/content`,
    { params, signal }
  );
  return response.data;
};

export const getCenso = async (
  id: CensoId,
  signal?: AbortSignal,
): Promise<Censo> => {
  const response = await api.get<{ data: Censo } | Censo>(`/censos/${id}`, { signal });
  const rawData = (response.data as any).data ?? response.data;

  return {
    ...rawData,
    description: rawData.description,
    start_date: rawData.init_date || rawData.start_date,
    end_date: rawData.deadline || rawData.end_date,
    created_at: rawData.created_at,
  };
};
