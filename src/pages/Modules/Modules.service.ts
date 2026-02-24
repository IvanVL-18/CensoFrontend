import api from "../../lib/Axios";
import type {
  Module,
  PaginatedModulesResponse,
  CreateModuleDTO,
  UpdateModuleDTO,
} from "./Modules.types";

export type ModuleFilter = "all" | "active" | "inactive";

type ModuleId = string | number;

export const getModules = async (
  filter: ModuleFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedModulesResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedModulesResponse>(
    `/Modules/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getModule = async (
  id: ModuleId,
  signal?: AbortSignal,
): Promise<Module> => {
  const response = await api.get<{ data: Module } | Module>(`/Modules/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createModule = async (
  ModuleData: CreateModuleDTO,
): Promise<{ message: string; data?: Module }> => {
  const response = await api.post("/Modules", ModuleData);
  return response.data;
};

export const updateModule = async (
  id: ModuleId,
  ModuleData: UpdateModuleDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/Modules/${id}`, ModuleData);
  return response.data;
};

export const banModule = async (id: ModuleId): Promise<{ message: string }> => {
  const response = await api.delete(`/Modules/${id}`);
  return response.data;
};

export const restoreModule = async (id: ModuleId): Promise<{ message: string }> => {
  const response = await api.post(`/Modules/${id}/restore`);
  return response.data;
};

export const forceDeleteModule = async (
  id: ModuleId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/Modules/${id}/force-delete`);
  return response.data;
};

export const importModules = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/Modules/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


