import api from "../../lib/Axios";
import type {
  PaginatedUsersResponse,
  User,
  CreateUserDTO,
  UpdateUserDTO,
  RoleOption,
} from "./Users.types";

type UserId = string | number;

export const getUsers = async (
  page: number = 1,
  signal?: AbortSignal
): Promise<PaginatedUsersResponse> => {
  const response = await api.get<PaginatedUsersResponse>(`/users?page=${page}`, {
    signal,
  });
  return response.data;
};

export const getUser = async (id: UserId, signal?: AbortSignal): Promise<User> => {
  // Ojo: tu backend hace Crypt::decryptString($id), así que aquí debe ir el id ENCRIPTADO tal cual viene del listado.
  const response = await api.get<{ data: User } | User>(`/users/${encodeURIComponent(String(id))}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createUser = async (data: CreateUserDTO) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (id: UserId, data: UpdateUserDTO) => {
  const response = await api.patch(`/users/${encodeURIComponent(String(id))}/updateUser`, data);
  return response.data;
};

export const banUser = async (id: UserId) =>
  (await api.delete(`/users/${encodeURIComponent(String(id))}`)).data;

export const restoreUser = async (id: UserId) =>
  (await api.post(`/users/${encodeURIComponent(String(id))}/restore`)).data;

export const forceDeleteUser = async (id: UserId) =>
  (await api.delete(`/users/${encodeURIComponent(String(id))}/force-delete`)).data;

export const importUsers = async (formData: FormData) => {
  const response = await api.post("/users/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getRolesSelector = async (signal?: AbortSignal): Promise<RoleOption[]> => {
  const response = await api.get<any>("/roles", { signal });

  const raw = (response.data as any).data ?? response.data;
  const items = Array.isArray(raw) ? raw : raw?.data ?? [];

  return items.map((r: any) => ({
    label: String(r.name ?? "Rol"),
    value: String(r.id ?? ""),
  }));
};
