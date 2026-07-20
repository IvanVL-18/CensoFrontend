import api from "../../lib/Axios";
import type { 
  Catalog,
  PaginatedCatalogsResponse,
  CreateCatalogDTO,
  UpdateCatalogDTO,
  Module,
} from "./Catalogs.types";

export type CatalogFilter = "all" | "active" | "inactive";

type CatalogId = string | number;

export const getCatalogs = async (
  filter: CatalogFilter = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedCatalogsResponse> => {
  const response = await api.post<PaginatedCatalogsResponse>(
    `/catalogs/search`,
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

export const getCatalog = async (
  id: CatalogId,
  signal?: AbortSignal,
): Promise<Catalog> => {
  const response = await api.get<{ data: Catalog } | Catalog>(`/catalogs/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};


export const getModules = async (
  filter: string = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<any> => { 
  const response = await api.post<any>(
    `/modules/search`,
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