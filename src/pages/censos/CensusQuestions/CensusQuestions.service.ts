import api from "../../../lib/Axios";
import type {
  GetCensusQuestionsResponse,
  StoreCensusQuestionsPayload,
  UpdateCensusQuestionsPayload,
  ApiMessageResponse,
} from "./Censusquestions.types";

type EncryptedCensusSectionId = string;


export const getCensusQuestions = async (
  censusSectionId: EncryptedCensusSectionId,
  page: number = 1,
  signal?: AbortSignal,
): Promise<GetCensusQuestionsResponse> => {
  const response = await api.get<GetCensusQuestionsResponse>(
    `/census-question/${censusSectionId}`,
    { signal, params: { page } },
  );
  return response.data;
};


export const storeCensusQuestions = async (
  payload: StoreCensusQuestionsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/census-question`,
    payload,
  );
  return response.data;
};


export const updateCensusQuestions = async (
  censusSectionId: EncryptedCensusSectionId,
  payload: UpdateCensusQuestionsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/census-question/${censusSectionId}`,
    payload,
  );
  return response.data;
};