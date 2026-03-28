import api from "../../lib/Axios";

export interface Permission {
  id: string;   // ID encriptado — usar para enviar al backend
  name: string; // Nombre estable — usar para comparar si está asignado
  guard_name?: string;
}

export interface PermissionRoleResponse {
  role: {
    id: string;               // encriptado, para la URL del update
    name: string;
    permissions_names: string[]; // ["roles.view", "users.create", ...] — comparar por name
  };
  permissionsCollection: Permission[];
}

export type RoleOption = {
  id: string;
  name: string;
};

type Paginated<T> = {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
  };
};

type RoleRow = {
  id?: number | string;
  encrypted_id?: string;
  encrypted_role_id?: string;
  name?: string;
};

export const getRolesContent = async (
  content: "active" | "inactive" | "all" = "active",
  page: number = 1,
  signal?: AbortSignal
): Promise<Paginated<RoleRow>> => {
  const res = await api.get<Paginated<RoleRow>>(`/roles/${content}/content`, {
    params: { page },
    signal,
  });
  return res.data;
};

export const getRolesForSelect = async (
  content: "active" | "inactive" | "all" = "active",
  signal?: AbortSignal
): Promise<RoleOption[]> => {
  const first = await getRolesContent(content, 1, signal);
  const totalPages = first.meta?.last_page ?? 1;

  const pages: Paginated<RoleRow>[] = [first];
  for (let p = 2; p <= totalPages; p++) {
    pages.push(await getRolesContent(content, p, signal));
  }

  const rows = pages.flatMap((x) => x.data ?? []);

  const mapped: RoleOption[] = rows
    .map((r) => {
      const id =
        r.encrypted_id ??
        r.encrypted_role_id ??
        (r.id !== undefined ? String(r.id) : "");
      const name = r.name ?? "";
      return { id, name };
    })
    .filter((r) => r.id && r.name);

  mapped.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return mapped;
};

export const getPermissionRole = async (
  encryptedRoleId: string,
  signal?: AbortSignal
): Promise<PermissionRoleResponse> => {
  const res = await api.get<PermissionRoleResponse>(`/permission-role/${encryptedRoleId}`, {
    signal,
  });
  return res.data;
};

export const updatePermissionRole = async (
  encryptedRoleId: string,
  permissionIds: string[]   // IDs encriptados de los permisos seleccionados
): Promise<{ message: string }> => {
  const res = await api.put(`/permission-role/${encryptedRoleId}`, {
    permissions_ids: permissionIds,
  });
  return res.data;
};