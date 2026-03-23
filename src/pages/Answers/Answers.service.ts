import api from "../../lib/Axios";
import type {
  question,
  PaginatedquestionsResponse,
  CreatequestionDTO,
  UpdatequestionDTO,
} from "./Answers.types";

export type questionFilter = "all" | "active" | "inactive";

type questionId = string | number;



export const getquestions = async (
  filter: questionFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedquestionsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedquestionsResponse>(
    `/questions/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getquestion = async (
  id: questionId,
  signal?: AbortSignal,
): Promise<question> => {
  const response = await api.get<{ data: question } | question>(`/questions/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createquestion = async (
  questionData: CreatequestionDTO,
): Promise<{ message: string; data?: question }> => {
  const response = await api.post("/questions", questionData);
  return response.data;
};

export const updatequestion = async (
  id: questionId,
  questionData: UpdatequestionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/questions/${id}`, questionData);
  return response.data;
};

export const banquestion = async (id: questionId): Promise<{ message: string }> => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const restorequestion = async (id: questionId): Promise<{ message: string }> => {
  const response = await api.post(`/questions/${id}/restore`);
  return response.data;
};

export const forceDeletequestion = async (
  id: questionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/questions/${id}/force-delete`);
  return response.data;
};

export const importquestions = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/questions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getquestionComponent = async (
  id: string | number,
  signal?: AbortSignal,
): Promise<{ question_structure: any }> => {
  const response = await api.get(`/questions/get-component/${id}`, {
    signal,
  });
  return response.data;
};

// En Answers.service.ts (al final)

export const saveAnswer = async (
  censusQuestionId: string,
  answerData: any
): Promise<{ message: string; data?: any }> => {
  const response = await api.post("/answers", {
    census_question_id: censusQuestionId, // ← encriptado, llega directo del URL
    answer: answerData,
  });
  return response.data;
};