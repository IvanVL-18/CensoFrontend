export interface Permission {
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

export interface PaginatedPermissionsResponse {
  data: Permission[];
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

export interface PermissionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export interface PermissionsTableProps {
  Permissions: Permission[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Permission) => void;
  onView: (Permission: Permission) => void;
  onEdit: (Permission: Permission) => void;
  onBan: (Permission: Permission) => void;
  onRestore: (Permission: Permission) => void;
  onDelete: (Permission: Permission) => void;
}
export interface ViewPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  Permission: Permission | null; 
}
export interface CreatePermissionDTO {
  name: string;
}
export type UpdatePermissionDTO = Partial<CreatePermissionDTO>;
