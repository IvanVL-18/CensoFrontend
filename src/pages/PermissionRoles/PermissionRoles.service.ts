import api from "../../lib/Axios";

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
}

export interface PermissionRoleResponse {
  encrypted_role_id: string;
  role: {
    id: number;
    name: string;
    permissions: Permission[];
  };
  permissionsCollection: Permission[];
}

export const getPermissionRole = async (
  idEnc: string,
  signal?: AbortSignal
): Promise<PermissionRoleResponse> => {
  const response = await api.get<PermissionRoleResponse>(`/permission-roles/${idEnc}`, {
    signal,
  });
  return response.data;
};

export const updatePermissionRole = async (
  idEnc: string,
  permissionIds: number[]
): Promise<{ message: string }> => {
  const response = await api.put(`/permission-roles/${idEnc}`, {
    permissions_ids: permissionIds, // ✅ como tu backend
  });
  return response.data;
};
