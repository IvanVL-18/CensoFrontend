import api from "../../lib/Axios";
import type {
  CountModel,
  CountResponse,
  CentralizedInstitutionsResponse,
  QuestionsByCensoResponse,
  PaginatedCensosResponse,
} from "./Dashboard.types";

export const getDashboardCount = async (
  model: CountModel,
  signal?: AbortSignal
): Promise<CountResponse> => {
  const res = await api.get<CountResponse>(`/dashboard/count/${model}`, {
    signal,
  });
  return res.data;
};

export const getCentralizedInstitutions = async (
  signal?: AbortSignal
): Promise<CentralizedInstitutionsResponse> => {
  const res = await api.get<CentralizedInstitutionsResponse>(
    `/dashboard/institutions/centralized-count`,
    { signal }
  );
  return res.data;
};

export const getQuestionsByCenso = async (
  signal?: AbortSignal
): Promise<QuestionsByCensoResponse> => {
  const res = await api.get<QuestionsByCensoResponse>(
    `/dashboard/questions-by-censo`,
    { signal }
  );
  return res.data;
};

export const getAllCensos = async (
  page: number = 1,
  signal?: AbortSignal
): Promise<PaginatedCensosResponse> => {
  const res = await api.get<PaginatedCensosResponse>(`/dashboard/censos`, {
    params: { page },
    signal,
  });
  return res.data;
};
