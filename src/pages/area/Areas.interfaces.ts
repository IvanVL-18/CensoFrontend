export interface Institution {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  name: string;

  institution: Institution | null;
  institution_id?: string;

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

export interface PaginatedAreasResponse {
  data: Area[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface CreateAreaDTO {
  name: string;
  institution_id: string;
}

export type UpdateAreaDTO = Partial<CreateAreaDTO>;
