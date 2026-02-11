export type CountModel = "users" | "institutions" | "censos";

export type CountResponse = {
  total: number;
};

export type CentralizedInstitutionsResponse = {
  total_centralized_institutions: number;
  total_institutions: number;
};

export type QuestionsByCensoItem = {
  id: string | number;
  name: string;
  total_preguntas: number;
};

export type QuestionsByCensoResponse = {
  data: QuestionsByCensoItem[];
};

export type MetaLink = {
  url: string | null;
  label: string;
  active: boolean;
};

export type Meta = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  links?: MetaLink[];
};

export type Links = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type QuestionnaireItem = {
  id: string; 
  name: string;
  deleted_at?: string | null;
};

export type PaginatedCensosResponse = {
  data: QuestionnaireItem[];
  meta: Meta;
  links: Links;
};
