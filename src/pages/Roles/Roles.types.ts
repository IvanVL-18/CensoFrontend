export interface Rol {
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
