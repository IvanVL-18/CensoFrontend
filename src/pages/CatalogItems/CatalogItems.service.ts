import api from "../../lib/Axios";
import type {
  CatalogItem,
  CatalogOption,
  PaginatedCatalogItemsResponse,
  PaginatedCatalogOptionsResponse,
  CreateCatalogItemDTO,
  UpdateCatalogItemDTO,
} from "./CatalogItems.types";

export type CatalogItemFilter = "all" | "active" | "inactive";

type CatalogItemId = string | number;

export const getCatalogItems = async (
  filter: CatalogItemFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",
  direction: "asc" | "desc" = "asc",
  signal?: AbortSignal,
): Promise<PaginatedCatalogItemsResponse> => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedCatalogItemsResponse>(
    `/catalog-items/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getCatalogItem = async (
  id: CatalogItemId,
  signal?: AbortSignal,
): Promise<CatalogItem> => {
  const response = await api.get<{ data: CatalogItem } | CatalogItem>(`/catalog-items/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createCatalogItem = async (
  catalogItemData: CreateCatalogItemDTO,
): Promise<{ message: string; data?: CatalogItem }> => {
  const response = await api.post("/catalog-items", catalogItemData);
  return response.data;
};

export const updateCatalogItem = async (
  id: CatalogItemId,
  catalogItemData: UpdateCatalogItemDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/catalog-items/${id}`, catalogItemData);
  return response.data;
};

export const banCatalogItem = async (id: CatalogItemId): Promise<{ message: string }> => {
  const response = await api.delete(`/catalog-items/${id}`);
  return response.data;
};

export const restoreCatalogItem = async (
  id: CatalogItemId,
): Promise<{ message: string }> => {
  const response = await api.post(`/catalog-items/${id}/restore`);
  return response.data;
};

export const forceDeleteCatalogItem = async (
  id: CatalogItemId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/catalog-items/${id}/force-delete`);
  return response.data;
};

export const getCatalogsForSelect = async (
  page: number = 1,
  signal?: AbortSignal,
): Promise<{ data: CatalogOption[]; lastPage: number }> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());

  const response = await api.get<PaginatedCatalogOptionsResponse>(
    "/catalogs/active/content",
    {
      params,
      signal,
    },
  );

  const data = response.data?.data ?? [];
  const mappedCatalogs: CatalogOption[] = data
    .filter((catalog) => catalog?.id != null)
    .map((catalog) => ({
      id: String(catalog.id),
      name: catalog.name,
    }));

  const lastPage = response.data?.meta?.last_page ?? 1;

  return {
    data: mappedCatalogs,
    lastPage,
  };
};


