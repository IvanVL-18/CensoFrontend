export interface Index {
  id: string | number;
  name: string;
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

export interface ConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonColor?: "danger" | "primary";
  onClose: () => void;
  onConfirm: () => void;
}

export interface FormErrorsProps {
  errors: string[];
}

export interface IndexModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onClearServerError: () => void;
}

export interface IndexsTableProps {
  Indexs: Index[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Index) => void;
  onView: (Index: Index) => void;
  onEdit: (Index: Index) => void;
  onBan: (Index: Index) => void;
  onRestore: (Index: Index) => void;
  onDelete: (Index: Index) => void;
}

export interface ViewIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  Index: Index | null;
}

export interface CreateIndexDTO {
  name: string;
}
export type UpdateIndexDTO = Partial<CreateIndexDTO>;