import api from "../../lib/Axios";
import type {
  MyCensusesResponse,
  CensusDetailResponse,
  AnswerData,
} from "./Answers.types";

export const getMyCensuses = async (): Promise<MyCensusesResponse> => {
  const response = await api.get<MyCensusesResponse>("/answers/my-censuses");
  return response.data;
};

export const getCensusDetail = async (
  censusId: string,
  signal?: AbortSignal
): Promise<CensusDetailResponse> => {
  const response = await api.get<CensusDetailResponse>(
    `/answers/census/${censusId}`,
    { signal }
  );
  return response.data;
};

export const saveAnswer = async (
  censusQuestionId: string,
  answer: string
): Promise<{ message: string; data: AnswerData }> => {
  const response = await api.post("/answers", {
    census_question_id: censusQuestionId,
    answer,
  });
  return response.data;
};

export const updateAnswer = async (
  answerId: string,
  answer: string
): Promise<{ message: string; data: AnswerData }> => {
  const response = await api.patch(`/answers/${answerId}`, { answer });
  return response.data;
};
