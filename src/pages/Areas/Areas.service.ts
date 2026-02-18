import api from "../../lib/Axios";
import type {
  Area,
  PaginatedAreasResponse,
  CreateAreaDTO,
  UpdateAreaDTO,
} from "./Areas.types";

export type AreaFilter = "all" | "active" | "inactive";

type AreaId = string | number;

export const getAreas = async (
  filter: AreaFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedAreasResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedAreasResponse>(
    `/area/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getArea = async (
  id: AreaId,
  signal?: AbortSignal,
): Promise<Area> => {
  const response = await api.get<{ data: Area } | Area>(`/area/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createArea = async (
  AreaData: CreateAreaDTO,
): Promise<{ message: string; data?: Area }> => {
  const response = await api.post("/area", AreaData);
  return response.data;
};

export const updateArea = async (
  id: AreaId,
  AreaData: UpdateAreaDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/area/${id}`, AreaData);
  return response.data;
};

export const banArea = async (id: AreaId): Promise<{ message: string }> => {
  const response = await api.delete(`/area/${id}`);
  return response.data;
};

export const restoreArea = async (id: AreaId): Promise<{ message: string }> => {
  const response = await api.post(`/area/${id}/restore`);
  return response.data;
};

export const forceDeleteArea = async (
  id: AreaId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/area/${id}/force-delete`);
  return response.data;
};

export const importAreas = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/area/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


