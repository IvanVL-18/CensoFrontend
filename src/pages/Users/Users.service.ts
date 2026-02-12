import api from "../../lib/Axios";
import type {
  User,
  PaginatedUsersResponse,
  CreateUserDTO,
  UpdateUserDTO,
} from "./Users.types";

export type UserFilter = "all" | "active" | "inactive";

type UserId = string | number;

export const getUsers = async (
  filter: UserFilter = "all",
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

  const response = await api.get<PaginatedUsersResponse>(
    `/users/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getUser = async (
  id: UserId,
  signal?: AbortSignal,
): Promise<User> => {
  const response = await api.get<{ data: User } | User>(`/users/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createUser = async (
  UserData: CreateUserDTO,
): Promise<{ message: string; data?: User }> => {
  const response = await api.post("/users", UserData);
  return response.data;
};

export const updateUser = async (
  id: UserId,
  UserData: UpdateUserDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/users/${id}`, UserData);
  return response.data;
};

export const banUser = async (id: UserId): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const restoreUser = async (id: UserId): Promise<{ message: string }> => {
  const response = await api.post(`/users/${id}/restore`);
  return response.data;
};

export const forceDeleteUser = async (
  id: UserId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}/force-delete`);
  return response.data;
};

export const importUsers = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/users/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


