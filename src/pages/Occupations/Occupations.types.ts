export interface Occupation {
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

export interface PaginatedOccupationsResponse {
  data: Occupation[];
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

export interface OccupationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export interface OccupationsTableProps {
  Occupations: Occupation[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Occupation) => void;
  onView: (Occupation: Occupation) => void;
  onEdit?: (Occupation: Occupation) => void;
  onBan?: (Occupation: Occupation) => void;
  onRestore?: (Occupation: Occupation) => void;
  onDelete?: (Occupation: Occupation) => void;
}

export interface ViewOccupationModalProps {
  isOpen: boolean;
  onClose: () => void;
  Occupation: Occupation | null;
}

export interface CreateOccupationDTO {
  name: string;
}
export type UpdateOccupationDTO = Partial<CreateOccupationDTO>;
