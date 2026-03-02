import api from "../../lib/Axios";
import type {
  Censo,
  PaginatedCensosResponse,
  CreateCensoDTO,
  UpdateCensoDTO,
} from "./Censos.types";

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

export const createCenso = async (
  censoData: CreateCensoDTO,
): Promise<{ message: string; data?: Censo }> => {
  const response = await api.post("/censos", censoData);
  return response.data;
};

export const updateCenso = async (
  id: CensoId,
  censoData: UpdateCensoDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/censos/${id}`, censoData);
  return response.data;
};

export const banCenso = async (id: CensoId): Promise<{ message: string }> => {
  const response = await api.delete(`/censos/${id}`);
  return response.data;
};

export const restoreCenso = async (id: CensoId): Promise<{ message: string }> => {
  const response = await api.post(`/censos/${id}/restore`);
  return response.data;
};

export const forceDeleteCenso = async (
  id: CensoId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/censos/${id}/force-delete`);
  return response.data;
};

export const importCensos = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/censos/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};