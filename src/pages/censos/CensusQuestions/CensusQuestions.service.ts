import api from "../../../lib/Axios";
import type {
  GetCensusQuestionsResponse,
  StoreCensusQuestionsPayload,
  UpdateCensusQuestionsPayload,
  ApiMessageResponse,
  EncryptedCensusSectionId,
} from "./CensusQuestions.types"; 

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

export const getQuestionComponent = async (
  questionId: string | number,
  signal?: AbortSignal,
): Promise<any> => {
  const response = await api.get(
    `/questions/get-component/${encodeURIComponent(String(questionId))}`,
    { signal },
  );
  return response.data;
};

export const askAi = async (
  censusQuestionId: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<{ response: string }> => {
  // El modelo de IA es local y lento: no fijamos timeout (timeout: 0).
  const { data } = await api.post<{ response: string }>(
    "/ai/chat",
    {
      census_question_id: censusQuestionId,
      prompt,
    },
    { signal, timeout: 0 },
  );
  return data;
};
