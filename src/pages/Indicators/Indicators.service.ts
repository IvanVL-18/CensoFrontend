import api from "../../lib/Axios";
import type {
  Indicator,
  PaginatedIndicatorsResponse,
  CreateIndicatorDTO,
  UpdateIndicatorDTO,
} from "./Indicators.types";

export type IndicatorFilter = "all" | "active" | "inactive";

type IndicatorId = string | number;

export const getIndicators = async (
  filter: IndicatorFilter = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",
  direction: "asc" | "desc" = "asc",
  signal?: AbortSignal,
  perPage: number = 10,
): Promise<PaginatedIndicatorsResponse> => {
  const response = await api.post<PaginatedIndicatorsResponse>(
    `/indicators/search`,
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

export const getIndicator = async (
  id: IndicatorId,
  signal?: AbortSignal,
): Promise<Indicator> => {
  const response = await api.get<{ data: Indicator } | Indicator>(
    `/indicators/${id}`,
    {
      signal,
    },
  );
  return (response.data as any).data ?? response.data;
};

export const createIndicator = async (
  IndicatorData: CreateIndicatorDTO,
): Promise<{ message: string; data?: Indicator }> => {
  const response = await api.post("/indicators", IndicatorData);
  return response.data;
};

export const updateIndicator = async (
  id: IndicatorId,
  IndicatorData: UpdateIndicatorDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/indicators/${id}`, IndicatorData);
  return response.data;
};

export const banIndicator = async (
  id: IndicatorId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/indicators/${id}`);
  return response.data;
};

export const restoreIndicator = async (
  id: IndicatorId,
): Promise<{ message: string }> => {
  const response = await api.post(`/indicators/${id}/restore`);
  return response.data;
};

export const forceDeleteIndicator = async (
  id: IndicatorId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/indicators/${id}/force-delete`);
  return response.data;
};

export const importIndicators = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/indicators/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
