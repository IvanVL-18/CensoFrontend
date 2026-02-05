
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

 export interface IndexsTableProps {
  indexs: Index[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Index) => void;
  onView: (index: Index) => void;
  onEdit: (index: Index) => void;
  onBan: (index: Index) => void;
  onRestore: (index: Index) => void;
  onDelete: (index: Index) => void;
}

export interface ViewIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  index: Index | null; 
}

 export interface PaginationProps {
  meta: Meta | null;
  links: PaginatedIndexsResponse["links"] | null;
  loading: boolean;
  error: string | null;
  onPageClick: (url: string | null) => void;
}

 export interface ConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  
  title: string;
  message: string; 
  confirmButtonText?: string; 
  confirmButtonColor?: 'danger' | 'primary'; 
  
  
  onClose: () => void;
  onConfirm: () => void;
} 

