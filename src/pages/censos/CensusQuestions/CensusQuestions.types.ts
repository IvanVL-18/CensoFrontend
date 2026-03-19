export interface CensusSectionInfo {
  id: string;
  index: string;
  name: string;
}

export interface QuestionOption {
  id: string;
  name: string;
}

export interface QuestionIndexOption {
  id: string;
  name: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationLinksObj {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedQuestionsResponse {
  current_page: number;
  data: QuestionOption[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SelectedQuestionItem {
  id: string;
  question: {
    id: string;
    name: string;
  };
  index: {
    id: string;
    name: string;
  };
}

export interface GetCensusQuestionsResponse {
  censusSection: CensusSectionInfo;
  questions: PaginatedQuestionsResponse;
  indexes: QuestionIndexOption[];
  selectedQuestions: SelectedQuestionItem[];
}

export interface CensusQuestionRow {
  question_id: string;
  question_name: string;
  checked: boolean;
  selected_index_id: string;
  stored_index_name: string | null;
  census_question_id: string | null;
}

export interface CensusQuestionItemPayload {
  index_id: string;
  question_id: string;
}

export interface StoreCensusQuestionsPayload {
  census_section_id: string;
  items: CensusQuestionItemPayload[];
}

export interface UpdateCensusQuestionItemPayload {
  census_question_id: string | null;
  index_id: string;
  question_id: string;
}

export interface UpdateCensusQuestionsPayload {
  items: UpdateCensusQuestionItemPayload[];
}

export interface ApiMessageResponse {
  message: string;
}

export type EncryptedCensusSectionId = string;
