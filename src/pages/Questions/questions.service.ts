// src/pages/questions/questions.service.ts
import type {
  Question,
  PaginatedQuestionsResponse,
  CreateQuestionDTO,
  UpdateQuestionDTO,
} from "./questions.interfaces";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export type QuestionFilter = "all" | "active" | "inactive";

const handleJsonResponse = async (response: Response) => {
  const text = await response.text();
  let data: any;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Error al procesar respuesta del servidor: ${text.slice(0, 120)}`
    );
  }

  if (!response.ok) {
    // Laravel Validation (422): errors:{campo:[msg]}
    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const firstMsg = Array.isArray(data.errors[firstKey])
        ? data.errors[firstKey][0]
        : String(data.errors[firstKey]);
      throw new Error(firstMsg);
    }

    throw new Error(
      data.message || `Error ${response.status}: ${response.statusText}`
    );
  }

  return data;
};

export const getQuestions = (
  filter: QuestionFilter = "all"
): Promise<PaginatedQuestionsResponse> => {
  const url = `${API_URL}/questions/${filter}/content`;
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const getQuestionsByUrl = (
  url: string
): Promise<PaginatedQuestionsResponse> => {
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const createQuestion = (
  payload: CreateQuestionDTO
): Promise<{ message: string }> => {
  const url = `${API_URL}/questions`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  }).then(handleJsonResponse);
};

export const updateQuestion = (
  id: string,
  payload: UpdateQuestionDTO
): Promise<{ message: string }> => {
  const url = `${API_URL}/questions/${id}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  }).then(handleJsonResponse);
};

export const getQuestion = (id: string): Promise<Question> => {
  const url = `${API_URL}/questions/${id}`;
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const banQuestion = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/questions/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const restoreQuestion = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/questions/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteQuestion = (
  id: string
): Promise<{ message: string }> => {
  const url = `${API_URL}/questions/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};
