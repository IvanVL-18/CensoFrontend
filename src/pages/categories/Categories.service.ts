import api from "../../lib/Axios";
import type { 
  Category,
  PaginatedCategoriesResponse,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "./Categories.types";

export type CategoryFilter = "all" | "active" | "inactive";

type CategoryId = string | number;



export const getCategories = async (
  filter: CategoryFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedCategoriesResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);
  params.append("filter", filter);

  const response = await api.get<PaginatedCategoriesResponse>(
    `/categories/search`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getCategory = async (
  id: CategoryId,
  signal?: AbortSignal,
): Promise<Category> => {
  const response = await api.get<{ data: Category } | Category>(`/categories/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createCategory = async (
  CategoryData: CreateCategoryDTO,
): Promise<{ message: string; data?: Category }> => {
  const response = await api.post("/categories", CategoryData);
  return response.data;
};

export const updateCategory = async (
  id: CategoryId,
  CategoryData: UpdateCategoryDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/categories/${id}`, CategoryData);
  return response.data;
};

export const banCategory = async (id: CategoryId): Promise<{ message: string }> => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const restoreCategory = async (id: CategoryId): Promise<{ message: string }> => {
  const response = await api.post(`/categories/${id}/restore`);
  return response.data;
};

export const forceDeleteCategory = async (
  id: CategoryId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/categories/${id}/force-delete`);
  return response.data;
};

export const importCategories = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/categories/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


