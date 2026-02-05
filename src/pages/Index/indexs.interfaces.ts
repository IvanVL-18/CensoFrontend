
import type { ChangeEvent } from "react";

export interface Index {
  id: string; 
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string; 
}


export interface MetaLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}


export interface Meta {
  total: number[];
  per_page: number[];
  current_page: number[];
  last_page: number[];
  from: number;
  links: MetaLink[]; 
  path: string;
  to: number;
}


export interface PaginatedIndexsResponse {
  data: Index[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}


export interface CreateIndexDTO {
  name: string;
  
}


export type UpdateIndexDTO = Partial<CreateIndexDTO>;

export interface ExcelFailure {
  row: number;
  field: string;
  errors: string[];
  invalid_value: any;
}

export interface BulkErrorModalProps {
  isOpen: boolean;
  errors: ExcelFailure[];
  onClose: () => void;
}

export type IndexFilter = "all" | "active" | "inactive";

 export interface IndexsToolbarProps {
  filter: IndexFilter;
  searchTerm: string;
  isSubmitting: boolean;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void; 
  onBulkUpload: (file: File) => void;
}