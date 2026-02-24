export interface Modulo {
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

export interface PaginatedModulosResponse {
  data: Modulo[];
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

export interface ModuloModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export interface ModulosTableProps {
  Modulos: Modulo[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Modulo) => void;
  onView: (Modulo: Modulo) => void;
  onEdit: (Modulo: Modulo) => void;
  onBan: (Modulo: Modulo) => void;
  onRestore: (Modulo: Modulo) => void;
  onDelete: (Modulo: Modulo) => void;
}
export interface ViewModuloModalProps {
  isOpen: boolean;
  onClose: () => void;
  Modulo: Modulo | null; 
}
export interface CreateModuloDTO {
  name: string;
}
export type UpdateModuloDTO = Partial<CreateModuloDTO>;
