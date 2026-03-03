import api from "../../lib/Axios";
import type { 
  Catalog,
  PaginatedCatalogsResponse,
  CreateCatalogDTO,
  UpdateCatalogDTO,
  Unit,
} from "./Catalogs.types";

export type CatalogFilter = "all" | "active" | "inactive";

type CatalogId = string | number;

export const getCatalogs = async (
  filter: CatalogFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedCatalogsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedCatalogsResponse>(
    `/catalogs/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getCatalog = async (
  id: CatalogId,
  signal?: AbortSignal,
): Promise<Catalog> => {
  const response = await api.get<{ data: Catalog } | Catalog>(`/catalogs/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};


export const getUnits = async (
  filter: string = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<any> => { 
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<any>(
    `/modules/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const createCatalog = async (
  CatalogData: CreateCatalogDTO,
): Promise<{ message: string; data?: Catalog }> => {
  const response = await api.post("/catalogs", CatalogData);
  return response.data;
};

export const updateCatalog = async (
  id: CatalogId,
  CatalogData: UpdateCatalogDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/catalogs/${id}`, CatalogData);
  return response.data;
};

export const banCatalog = async (id: CatalogId): Promise<{ message: string }> => {
  const response = await api.delete(`/catalogs/${id}`);
  return response.data;
};

export const restoreCatalog = async (id: CatalogId): Promise<{ message: string }> => {
  const response = await api.post(`/catalogs/${id}/restore`);
  return response.data;
};

export const forceDeleteCatalog = async (
  id: CatalogId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/catalogs/${id}/force-delete`);
  return response.data;
};

export const importCatalogs = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/catalogs/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};