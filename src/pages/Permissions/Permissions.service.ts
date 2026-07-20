import api from "../../lib/Axios";
import type {
  Permission,
  PaginatedPermissionsResponse,
  CreatePermissionDTO,
  UpdatePermissionDTO,
} from "./Permissions.types";

export type PermissionFilter = "all" | "active" | "inactive";

type PermissionId = string | number;



export const getPermissions = async (
  filter: PermissionFilter = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedPermissionsResponse> => {
  const response = await api.post<PaginatedPermissionsResponse>(
    `/permissions/search`,
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



export const getPermission = async (
  id: PermissionId,
  signal?: AbortSignal,
): Promise<Permission> => {
  const response = await api.get<{ data: Permission } | Permission>(`/permissions/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createPermission = async (
  PermissionData: CreatePermissionDTO,
): Promise<{ message: string; data?: Permission }> => {
  const response = await api.post("/permissions", PermissionData);
  return response.data;
};

export const updatePermission = async (
  id: PermissionId,
  PermissionData: UpdatePermissionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/permissions/${id}`, PermissionData);
  return response.data;
};

export const banPermission = async (id: PermissionId): Promise<{ message: string }> => {
  const response = await api.delete(`/permissions/${id}`);
  return response.data;
};

export const restorePermission = async (id: PermissionId): Promise<{ message: string }> => {
  const response = await api.post(`/permissions/${id}/restore`);
  return response.data;
};

export const forceDeletePermission = async (
  id: PermissionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/permissions/${id}/force-delete`);
  return response.data;
};

export const importPermissions = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/permissions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


