import api from "../../lib/Axios";
import type {
  Unit,
  PaginatedUnitsResponse,
  CreateUnitDTO,
  UpdateUnitDTO,
} from "./units.types";

export type UnitFilter = "all" | "active" | "inactive";

type UnitId = string | number;

export const getUnits = async (
  filter: UnitFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedUnitsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedUnitsResponse>(
    `/units/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getUnit = async (
  id: UnitId,
  signal?: AbortSignal,
): Promise<Unit> => {
  const response = await api.get<{ data: Unit } | Unit>(`/units/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createUnit = async (
  unitData: CreateUnitDTO,
): Promise<{ message: string; data?: Unit }> => {
  const response = await api.post("/units", unitData);
  return response.data;
};

export const updateUnit = async (
  id: UnitId,
  unitData: UpdateUnitDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/units/${id}`, unitData);
  return response.data;
};

export const banUnit = async (id: UnitId): Promise<{ message: string }> => {
  const response = await api.delete(`/units/${id}`);
  return response.data;
};

export const restoreUnit = async (id: UnitId): Promise<{ message: string }> => {
  const response = await api.post(`/units/${id}/restore`);
  return response.data;
};

export const forceDeleteUnit = async (
  id: UnitId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/units/${id}/force-delete`);
  return response.data;
};

export const importUnits = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/units/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


