import api from "../../lib/Axios";
import type {
  Censo,
  PaginatedCensosResponse,
  CreateCensoDTO,
  UpdateCensoDTO,
  Index,
  ModuleForCensoShowResponse,
  ModuleForCensoRequest,
  GetCensusResponse,
  GetCensusFiltersResponse,
  CensusQueryFilters,
  CensusQueryResponse,
  CensusOption,
  FindCensusResult,
  FindQuestionsResult,
  QuestionDetail,
} from "./Censos.types";

export type CensoFilter = "all" | "active" | "inactive";
type CensoId = string | number;

const firstDefined = <T>(
  ...values: Array<T | null | undefined>
): T | undefined => {
  for (const value of values) {
    if (value !== null && value !== undefined) return value;
  }
  return undefined;
};

export const getCensos = async (
  filter: CensoFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",
  direction: "asc" | "desc" = "asc",
  signal?: AbortSignal,
): Promise<PaginatedCensosResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedCensosResponse>(
    `/censuses/${filter}/content`,
    { params, signal },
  );
  return response.data;
};

export const getCenso = async (
  id: CensoId,
  signal?: AbortSignal,
): Promise<Censo> => {
  const response = await api.get(`/censuses/${id}`, {
    signal,
  });
  const responseData = response.data as any;
  const rawData = responseData?.data?.data ?? responseData?.data ?? responseData;
  const censoData = rawData?.censo ?? rawData?.census ?? rawData;

  return {
    ...rawData,
    ...censoData,
    description: firstDefined(
      censoData?.description,
      censoData?.descripcion,
      rawData?.description,
      rawData?.descripcion,
    ),
    start_date: firstDefined(
      censoData?.init_date,
      censoData?.start_date,
      rawData?.init_date,
      rawData?.start_date,
    ),
    end_date: firstDefined(
      censoData?.deadline,
      censoData?.end_date,
      rawData?.deadline,
      rawData?.end_date,
    ),
    created_at: firstDefined(censoData?.created_at, rawData?.created_at) ?? "",
    updated_at: firstDefined(censoData?.updated_at, rawData?.updated_at) ?? "",
    deleted_at: firstDefined(censoData?.deleted_at, rawData?.deleted_at) ?? null,
  };
};

export const createCenso = async (
  censoData: CreateCensoDTO,
): Promise<{ message: string; data?: Censo }> => {
  const response = await api.post("/censuses", censoData);
  return response.data;
};

export const updateCenso = async (
  id: CensoId,
  censoData: UpdateCensoDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/censuses/${id}`, censoData);
  return response.data;
};

export const banCenso = async (id: CensoId): Promise<{ message: string }> => {
  const response = await api.delete(`/censuses/${id}`);
  return response.data;
};

export const restoreCenso = async (
  id: CensoId,
): Promise<{ message: string }> => {
  const response = await api.post(`/censuses/${id}/restore`);
  return response.data;
};

export const forceDeleteCenso = async (
  id: CensoId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/censuses/${id}/force-delete`);
  return response.data;
};

export const importCensos = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/censuses/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getIndices = async (signal?: AbortSignal): Promise<Index[]> => {
  const response = await api.get<{ data: Index[] } | Index[]>("/index", {
    signal,
  });
  const rawData = (response.data as any).data ?? response.data;
  return rawData;
};

export const getCensoModules = async (
  id: string,
  signal?: AbortSignal,
): Promise<ModuleForCensoShowResponse> => {
  const response = await api.get<ModuleForCensoShowResponse>(
    `/module-for-censo/${id}`,
    { signal },
  );
  return response.data;
};

export const updateCensoModules = async (
  id: string,
  data: ModuleForCensoRequest,
): Promise<{ message: string }> => {
  const response = await api.put(`/module-for-censo/${id}`, data);
  return response.data;
};

export const createCensoModules = async (
  data: ModuleForCensoRequest & { censo_id: number },
): Promise<{ message: string }> => {
  const response = await api.post("/module-for-censo", data);
  return response.data; 
};


export const cloneCenso = async (
  sourceCensusId: CensoId,
  targetCensusId: CensoId,
): Promise<{ message: string }> => {
  const response = await api.post("/censuses/clone", {
    source_census_id: sourceCensusId,
    target_census_id: targetCensusId,
  });
  return response.data;
};

export const getCensusStructure = async (
  censusId: string,
  mode: "full" | "personalized",
  moduleId?: string,
): Promise<GetCensusResponse> => {
  const body: Record<string, string> = { census_id: censusId, mode };
  if (mode === "personalized" && moduleId) body.module_id = moduleId;
  const { data } = await api.post("/censuses/get-census", body);
  return data;
};

export const getCensusFilters = async (
  censusId: string,
  signal?: AbortSignal,
): Promise<GetCensusFiltersResponse> => {
  const { data } = await api.get(`/censuses/${censusId}/get-filters`, { signal });
  return data;
};

export const queryCensusSections = async (
  filters: CensusQueryFilters,
  signal?: AbortSignal,
): Promise<CensusQueryResponse> => {
  const { data } = await api.post("/censuses/filters", filters, { signal });
  return data;
};

export const getCensusesList = async (
  signal?: AbortSignal,
): Promise<CensusOption[]> => {
  const response = await api.get<{ data: CensusOption[] }>("/censuses", {
    signal,
  });
  return response.data.data;
};

export const findCensus = async (
  censusIds: string[],
): Promise<FindCensusResult> => {
  const response = await api.post<FindCensusResult>("/find-census", {
    censos: censusIds,
  });
  return response.data;
};

export const findQuestions = async (
  censusId: string,
  search: string,
): Promise<FindQuestionsResult> => {
  const response = await api.post<FindQuestionsResult>("/find-questions", {
    censos: [censusId],
    questions: [search],
  });
  return response.data;
};

export const getQuestionDetail = async (
  questionId: string,
  signal?: AbortSignal,
): Promise<QuestionDetail> => {
  const response = await api.get<{ data: QuestionDetail }>(
    `/questions/${questionId}`,
    { signal },
  );
  return response.data.data;
};
