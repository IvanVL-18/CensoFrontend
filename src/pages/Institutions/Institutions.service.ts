import api from "../../lib/Axios";
import type {
  Institution,
  PaginatedInstitutionsResponse,
  CreateInstitutionDTO,
  UpdateInstitutionDTO,
} from "../Institutions/institutions.types";

export type InstitutionFilter = "all" | "active" | "inactive";

type InstitutionId = string | number;


export const getInstitutions = async (
  filter: InstitutionFilter = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",           
  direction: "asc" | "desc" = "asc",  
  signal?: AbortSignal,
): Promise<PaginatedInstitutionsResponse> => {
  const response = await api.post<PaginatedInstitutionsResponse>(
    `/institutions/search`,
    {
      status: filter,
      search: search || undefined,
      order: direction,
    },
    {
      params: { page },
      signal,
    },
  );
  return response.data;
};

export const getInstitution = async (
  id: InstitutionId,
  signal?: AbortSignal,
): Promise<Institution> => {
  const response = await api.get<{ data: Institution } | Institution>(`/institutions/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createInstitution = async (
  ModuleData: CreateInstitutionDTO,
): Promise<{ message: string; data?: Institution }> => {
  const response = await api.post("/institutions", ModuleData);
  return response.data;
};

export const updateInstitution = async (
  id: InstitutionId,
  institutionData: UpdateInstitutionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/institutions/${id}`, institutionData);
  return response.data;
};

export const banInstitution = async (id: InstitutionId): Promise<{ message: string }> => {
  const response = await api.delete(`/institutions/${id}`);
  return response.data;
};

export const restoreInstitution = async (id: InstitutionId): Promise<{ message: string }> => {
  const response = await api.post(`/institutions/${id}/restore`);
  return response.data;
};

export const forceDeleteInstitution = async (
  id: InstitutionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/institutions/${id}/force-delete`);
  return response.data;
};

export const importInstitutions = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/modules/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};




