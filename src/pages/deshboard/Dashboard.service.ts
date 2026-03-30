import api from "../../lib/Axios";
import type {
  CountModel,
  CountResponse,
  CentralizedInstitutionsResponse,
  QuestionsByCensoResponse,
  PaginatedCensosResponse,
} from "./dashboard.types";

export const getDashboardCount = async (model: CountModel) => {
  const res = await api.get<CountResponse>(`/count/${model}`);
  return res.data;
};

export const getCentralizedInstitutions = async () => {
  const res = await api.get<CentralizedInstitutionsResponse>(
    `/institutions/centralized/count`
  );
  return res.data;
};

export const getQuestionsByCenso = async () => {
  const res = await api.get<QuestionsByCensoResponse>(
    `/dashboard/questions-by-censo`
  );
  return res.data;
};

export const getAllCensos = async (page: number = 1) => {
  const res = await api.get<PaginatedCensosResponse>(
    `/dashboard/get-censos`,
    {
      params: { page },
    }
  );
  return res.data;
};