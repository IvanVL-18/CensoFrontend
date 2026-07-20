import api from "../../lib/Axios";
import type {
  Occupation,
  PaginatedOccupationsResponse,
  CreateOccupationDTO,
  UpdateOccupationDTO,
} from "./Occupations.types";

export type OccupationFilter = "all" | "active" | "inactive";

type OccupationId = string | number;



export const getOccupations = async (
  filter: OccupationFilter = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedOccupationsResponse> => {
  const response = await api.post<PaginatedOccupationsResponse>(
    `/occupations/search`,
    {
      status: filter,
      content: search || undefined,
      order: direction,
    },
    {
      params: { page },
      signal,
    },
  );
  return response.data;
};



export const getOccupation = async (
  id: OccupationId,
  signal?: AbortSignal,
): Promise<Occupation> => {
  const response = await api.get<{ data: Occupation } | Occupation>(`/occupations/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createOccupation = async (
  OccupationData: CreateOccupationDTO,
): Promise<{ message: string; data?: Occupation }> => {
  const response = await api.post("/occupations", OccupationData);
  return response.data;
};

export const updateOccupation = async (
  id: OccupationId,
  OccupationData: UpdateOccupationDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/occupations/${id}`, OccupationData);
  return response.data;
};

export const banOccupation = async (id: OccupationId): Promise<{ message: string }> => {
  const response = await api.delete(`/occupations/${id}`);
  return response.data;
};

export const restoreOccupation = async (id: OccupationId): Promise<{ message: string }> => {
  const response = await api.post(`/occupations/${id}/restore`);
  return response.data;
};

export const forceDeleteOccupation = async (
  id: OccupationId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/occupations/${id}/force-delete`);
  return response.data;
};

export const importOccupations = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/occupations/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


