import api from "../../lib/Axios";
import type {
  Index,
  PaginatedIndexsResponse,
  CreateIndexDTO,
  UpdateIndexDTO,
} from "./Indexs.types";

export type IndexFilter = "all" | "active" | "inactive";

type IndexId = string | number;



export const getIndexs = async (
  filter: IndexFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedIndexsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedIndexsResponse>(
    `/Indexs/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getIndex = async (
  id: IndexId,
  signal?: AbortSignal,
): Promise<Index> => {
  const response = await api.get<{ data: Index } | Index>(`/indexs/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createIndex = async (
  IndexData: CreateIndexDTO,
): Promise<{ message: string; data?: Index }> => {
  const response = await api.post("/indexs", IndexData);
  return response.data;
};

export const updateIndex = async (
  id: IndexId,
  IndexData: UpdateIndexDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/indexs/${id}`, IndexData);
  return response.data;
};

export const banIndex = async (id: IndexId): Promise<{ message: string }> => {
  const response = await api.delete(`/indexs/${id}`);
  return response.data;
};

export const restoreIndex = async (id: IndexId): Promise<{ message: string }> => {
  const response = await api.post(`/indexs/${id}/restore`);
  return response.data;
};

export const forceDeleteIndex = async (
  id: IndexId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/indexs/${id}/force-delete`);
  return response.data;
};

export const importIndexs = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/indexs/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


