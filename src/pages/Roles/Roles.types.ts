export interface Rol {
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

export interface PaginatedRolesResponse {
  data: Rol[];
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

export interface RolModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;

  onClearServerError: () => void;
}

export interface RolesTableProps {
  Roles: Rol[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Rol) => void;
  onView: (Rol: Rol) => void;
  onEdit: (Rol: Rol) => void;
  onBan: (Rol: Rol) => void;
  onRestore: (Rol: Rol) => void;
  onDelete: (Rol: Rol) => void;
}

export interface ViewRolModalProps {
  isOpen: boolean;
  onClose: () => void;
  Rol: Rol | null;
}

export interface CreateRolDTO {
  name: string;
}

export type UpdateRolDTO = Partial<CreateRolDTO>;
