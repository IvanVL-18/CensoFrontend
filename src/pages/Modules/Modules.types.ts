export interface Module {
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

export interface PaginatedModulesResponse {
  data: Module[];
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

export interface ModuleModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onClearServerError: () => void;
}

export interface ModulesTableProps {
  Modules: Module[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Module) => void;
  onView: (Module: Module) => void;
  onEdit: (Module: Module) => void;
  onBan: (Module: Module) => void;
  onRestore: (Module: Module) => void;
  onDelete: (Module: Module) => void;
}

export interface ViewModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  Module: Module | null;
}

export interface CreateModuleDTO {
  name: string;
}

export type UpdateModuleDTO = Partial<CreateModuleDTO>;
