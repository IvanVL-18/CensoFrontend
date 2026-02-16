import api from "../../lib/Axios";
import type {
  PaginatedUsersResponse,
  User,
  CreateUserDTO,
  UpdateUserDTO,
  RoleOption,
} from "./Users.types";

export type UserFilter = "all" | "active" | "inactive";
type UserId = string | number;

export const getUsers = async (
  _filter: UserFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",
  direction: "asc" | "desc" = "asc",
  signal?: AbortSignal,
): Promise<PaginatedUsersResponse> => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedUsersResponse>("/users", { params, signal });
  return response.data;
};

export const getUser = async (id: UserId, signal?: AbortSignal): Promise<User> => {
  const response = await api.get<{ data: User } | User>(`/users/${id}`, { signal });
  return (response.data as any).data ?? response.data;
};

export const createUser = async (data: CreateUserDTO) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (id: UserId, data: UpdateUserDTO) => {
  const response = await api.patch(`/users/${id}/updateUser`, data);
  return response.data;
};

export const banUser = async (id: UserId) => (await api.delete(`/users/${id}`)).data;
export const restoreUser = async (id: UserId) => (await api.post(`/users/${id}/restore`)).data;
export const forceDeleteUser = async (id: UserId) => (await api.delete(`/users/${id}/force-delete`)).data;

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

