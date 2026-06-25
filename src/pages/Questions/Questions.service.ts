import api from "../../lib/Axios";
import type {
  Question,
  PaginatedQuestionsResponse,
  CreateQuestionDTO,
  UpdateQuestionDTO,
} from "./Questions.types";

export type QuestionFilter = "all" | "active" | "inactive";

type QuestionId = string | number;



export const getQuestions = async (
  filter: QuestionFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedQuestionsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);
  params.append("filter", filter);

  const response = await api.get<PaginatedQuestionsResponse>(
    `/questions/search`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getQuestion = async (
  id: QuestionId,
  signal?: AbortSignal,
): Promise<Question> => {
  const response = await api.get<{ data: Question } | Question>(`/questions/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createQuestion = async (
  QuestionData: CreateQuestionDTO,
): Promise<{ message: string; data?: Question }> => {
  const response = await api.post("/questions", QuestionData);
  return response.data;
};

export const updateQuestion = async (
  id: QuestionId,
  QuestionData: UpdateQuestionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/questions/${id}`, QuestionData);
  return response.data;
};

export const banQuestion = async (id: QuestionId): Promise<{ message: string }> => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const restoreQuestion = async (id: QuestionId): Promise<{ message: string }> => {
  const response = await api.post(`/questions/${id}/restore`);
  return response.data;
};

export const forceDeleteQuestion = async (
  id: QuestionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/questions/${id}/force-delete`);
  return response.data;
};

export const importQuestions = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/questions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getQuestionComponent = async (
  id: string | number,
  signal?: AbortSignal,
): Promise<{ question_structure: any }> => {
  const response = await api.get(`/questions/get-component/${id}`, {
    signal,
  });
  return response.data;
};