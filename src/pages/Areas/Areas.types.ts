export interface Area {
  id: string | number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MetaLink {
  url: string | null;
  label: string;
  active: boolean;
  page?: number | null;
}

export interface Meta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;

  from: number;
  to: number;

  links: MetaLink[];
  path: string;
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

export interface AreaModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;

  onClearServerError: () => void;
}

export interface AreasTableProps {
  Areas: Area[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Area) => void;
  onView: (Area: Area) => void;
  onEdit: (Area: Area) => void;
  onBan: (Area: Area) => void;
  onRestore: (Area: Area) => void;
  onDelete: (Area: Area) => void;
}

export interface ViewAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  Area: Area | null;
}

export interface CreateAreaDTO {
  name: string;
}

export type UpdateAreaDTO = Partial<CreateAreaDTO>;
