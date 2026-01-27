// src/pages/questions/questions.interfaces.ts

export type QuestionType = "empty" | "radio" | "check" | "selector";

export interface Option {
  id?: string;
  name: string;
}

export interface Question {
  id: string;
  name: string;

  // vienen del QuestionResource
  commentaries: boolean;
  instructions: string | null;
  type: QuestionType;
  options?: Option[];

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MetaLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface Meta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  links: MetaLink[];
  path: string;
  to: number;
}

export interface PaginatedQuestionsResponse {
  data: Question[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface CreateQuestionDTO {
  name: string;
  commentaries?: boolean | null;
  instructions?: string | null;
  type: QuestionType;
  options?: { name: string }[]; // requerido salvo type=empty
}

export type UpdateQuestionDTO = Partial<CreateQuestionDTO>;

export type SortDirection = "ascending" | "descending";

export type SortConfig = {
  key: keyof Question;
  direction: SortDirection;
};

