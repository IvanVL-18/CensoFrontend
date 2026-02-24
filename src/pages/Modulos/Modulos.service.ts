import api from "../../lib/Axios";
import type {
  Modulo,
  PaginatedModulosResponse,
  CreateModuloDTO,
  UpdateModuloDTO,
} from "./Modulos.types";

export type ModuloFilter = "all" | "active" | "inactive";

type ModuloId = string | number;

export const getModulos = async (
  filter: ModuloFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedModulosResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedModulosResponse>(
    `/Modulos/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getModulo = async (
  id: ModuloId,
  signal?: AbortSignal,
): Promise<Modulo> => {
  const response = await api.get<{ data: Modulo } | Modulo>(`/Modulos/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createModulo = async (
  ModuloData: CreateModuloDTO,
): Promise<{ message: string; data?: Modulo }> => {
  const response = await api.post("/Modulos", ModuloData);
  return response.data;
};

export const updateModulo = async (
  id: ModuloId,
  ModuloData: UpdateModuloDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/Modulos/${id}`, ModuloData);
  return response.data;
};

export const banModulo = async (id: ModuloId): Promise<{ message: string }> => {
  const response = await api.delete(`/Modulos/${id}`);
  return response.data;
};

export const restoreModulo = async (id: ModuloId): Promise<{ message: string }> => {
  const response = await api.post(`/Modulos/${id}/restore`);
  return response.data;
};

export const forceDeleteModulo = async (
  id: ModuloId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/Modulos/${id}/force-delete`);
  return response.data;
};

export const importModulos = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/Modulos/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


