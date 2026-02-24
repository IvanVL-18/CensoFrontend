export interface Dependencie {
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

export interface PaginatedDependenciesResponse {
  data: Dependencie[];
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

export interface DependencieModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;

  onClearServerError: () => void;
}

export interface DependenciesTableProps {
  Dependencies: Dependencie[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Dependencie) => void;
  onView: (Dependencie: Dependencie) => void;
  onEdit: (Dependencie: Dependencie) => void;
  onBan: (Dependencie: Dependencie) => void;
  onRestore: (Dependencie: Dependencie) => void;
  onDelete: (Dependencie: Dependencie) => void;
}

export interface ViewDependencieModalProps {
  isOpen: boolean;
  onClose: () => void;
  Dependencie: Dependencie | null;
}

export interface CreateDependencieDTO {
  name: string;
}

export type UpdateDependencieDTO = Partial<CreateDependencieDTO>;
