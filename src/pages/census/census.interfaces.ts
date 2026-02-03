export type ContentFilter = "active" | "inactive" | "all";

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
};
export type Census = {
  id: string;
  name: string;
  description: string | null;
  init_date: string | null;
  deadline: string | null;

  deleted_at?: string | null;
  is_active?: boolean;

  code?: string | null;
  questions_count?: number | null;
};

export type CreateCensusPayload = {
  name: string;
  description: string;
  year?: string | number;
  init_date: string | null;
  deadline: string | null;
  is_active?: boolean;
};
export type CensusFormValues = {
  name: string;
  year: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type Unit = {
  id: string | number;
  name: string;
  key?: string | null;
  [key: string]: any;
};

export type Section = {
  id: string | number;
  name: string;
  key?: string | null;
  [key: string]: any;
};
