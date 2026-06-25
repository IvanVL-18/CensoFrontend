import api from "../../lib/Axios";
import type {
  Rol,
  PaginatedRolesResponse,
  CreateRolDTO,
  UpdateRolDTO,
} from "./Roles.types";

export type RolFilter = "all" | "active" | "inactive";

type RolId = string | number;

export const getRoles = async (
  filter: RolFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedRolesResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);
  params.append("filter", filter);

  const response = await api.get<PaginatedRolesResponse>(
    `/roles/search`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getRol = async (
  id: RolId,
  signal?: AbortSignal,
): Promise<Rol> => {
  const response = await api.get<{ data: Rol } | Rol>(`/roles/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createRol = async (
  RolData: CreateRolDTO,
): Promise<{ message: string; data?: Rol }> => {
  const response = await api.post("/roles", RolData);
  return response.data;
};

export const updateRol = async (
  id: RolId,
  RolData: UpdateRolDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/roles/${id}`, RolData);
  return response.data;
};

export const banRol = async (id: RolId): Promise<{ message: string }> => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export const restoreRol = async (id: RolId): Promise<{ message: string }> => {
  const response = await api.post(`/roles/${id}/restore`);
  return response.data;
};

export const forceDeleteRol = async (
  id: RolId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/roles/${id}/force-delete`);
  return response.data;
};

export const importRoles = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/roles/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


