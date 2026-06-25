import api from "../../lib/Axios";
import type {
  Dependency,
  PaginatedDependenciesResponse,
  CreateDependencyDTO,
  UpdateDependencyDTO,
} from "./Dependencies.types";

export type DependencyFilter = "all" | "active" | "inactive";

type DependencyId = string | number;

export const getDependencies = async (
  filter: DependencyFilter = "all",
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
  params.append("filter", filter);

  const response = await api.get<PaginatedDependenciesResponse>(
    `/dependency/search`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getDependency = async (
  id: DependencyId,
  signal?: AbortSignal,
): Promise<Dependency> => {
  const response = await api.get<{ data: Dependency } | Dependency>(`/dependency/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createDependency = async (
  DependencyData: CreateDependencyDTO,
): Promise<{ message: string; data?: Dependency }> => {
  const response = await api.post("/dependency", DependencyData);
  return response.data;
};

export const updateDependency = async (
  id: DependencyId,
  DependencyData: UpdateDependencyDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/dependency/${id}`, DependencyData);
  return response.data;
};

export const banDependency = async (id: DependencyId): Promise<{ message: string }> => {
  const response = await api.delete(`/dependency/${id}`);
  return response.data;
};

export const restoreDependency = async (id: DependencyId): Promise<{ message: string }> => {
  const response = await api.post(`/dependency/${id}/restore`);
  return response.data;
};

export const forceDeleteDependency = async (
  id: DependencyId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/dependency/${id}/force-delete`);
  return response.data;
};

export const importDependencies = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/dependency/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


