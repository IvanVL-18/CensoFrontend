import api from "../../lib/Axios";
import type {
  Dependencia,
  PaginatedDependenciasResponse,
  CreateDependenciaDTO,
  UpdateDependenciaDTO,
} from "./Dependencias.types";

export type DependenciaFilter = "all" | "active" | "inactive";

type DependenciaId = string | number;

export const getDependencias = async (
  filter: DependenciaFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedDependenciasResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedDependenciasResponse>(
    `/Dependencia/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getDependencia = async (
  id: DependenciaId,
  signal?: AbortSignal,
): Promise<Dependencia> => {
  const response = await api.get<{ data: Dependencia } | Dependencia>(`/Dependencia/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createDependencia = async (
  DependenciaData: CreateDependenciaDTO,
): Promise<{ message: string; data?: Dependencia }> => {
  const response = await api.post("/Dependencia", DependenciaData);
  return response.data;
};

export const updateDependencia = async (
  id: DependenciaId,
  DependenciaData: UpdateDependenciaDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/Dependencia/${id}`, DependenciaData);
  return response.data;
};

export const banDependencia = async (id: DependenciaId): Promise<{ message: string }> => {
  const response = await api.delete(`/Dependencia/${id}`);
  return response.data;
};

export const restoreDependencia = async (id: DependenciaId): Promise<{ message: string }> => {
  const response = await api.post(`/Dependencia/${id}/restore`);
  return response.data;
};

export const forceDeleteDependencia = async (
  id: DependenciaId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/Dependencia/${id}/force-delete`);
  return response.data;
};

export const importDependencias = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/Dependencia/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


