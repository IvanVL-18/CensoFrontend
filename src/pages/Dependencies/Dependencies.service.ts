import api from "../../lib/Axios";
import type {
  Dependencie,
  PaginatedDependenciesResponse,
  CreateDependencieDTO,
  UpdateDependencieDTO,
} from "./Dependencies.types";

export type DependencieFilter = "all" | "active" | "inactive";

type DependencieId = string | number;

export const getDependencies = async (
  filter: DependencieFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedDependenciesResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedDependenciesResponse>(
    `/Dependencie/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getDependencie = async (
  id: DependencieId,
  signal?: AbortSignal,
): Promise<Dependencie> => {
  const response = await api.get<{ data: Dependencie } | Dependencie>(`/Dependencie/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createDependencie = async (
  DependencieData: CreateDependencieDTO,
): Promise<{ message: string; data?: Dependencie }> => {
  const response = await api.post("/Dependencie", DependencieData);
  return response.data;
};

export const updateDependencie = async (
  id: DependencieId,
  DependencieData: UpdateDependencieDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/Dependencie/${id}`, DependencieData);
  return response.data;
};

export const banDependencie = async (id: DependencieId): Promise<{ message: string }> => {
  const response = await api.delete(`/Dependencie/${id}`);
  return response.data;
};

export const restoreDependencie = async (id: DependencieId): Promise<{ message: string }> => {
  const response = await api.post(`/Dependencie/${id}/restore`);
  return response.data;
};

export const forceDeleteDependencie = async (
  id: DependencieId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/Dependencie/${id}/force-delete`);
  return response.data;
};

export const importDependencies = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/Dependencie/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


