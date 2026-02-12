export interface User {
  id: string;
  name: string;
  lastname: string | null;
  phone: string | null;
  movil: string | null;
  address: string | null;
  email: string;
  occupation_id: string | null;
  role_id: string | null;
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

export interface PaginatedUsersResponse {
  data: User[];
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

/** DTOs alineados a tu migración */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;

  lastname?: string;
  phone?: string;
  movil?: string;
  address?: string;
  occupation_id?: string;
  role_id?: string;
}

export type UpdateUserDTO = Partial<CreateUserDTO>;


export interface UserModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  mode: "create" | "edit";

  // 👇 CAMBIO CLAVE:
  initialValues?: Partial<User> | null;

  onClose: () => void;
  onSave: (data: CreateUserDTO | UpdateUserDTO) => void;
}

export interface UsersTableProps {
  Users: User[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof User) => void;
  onView: (User: User) => void;
  onEdit: (User: User) => void;
  onBan: (User: User) => void;
  onRestore: (User: User) => void;
  onDelete: (User: User) => void;
}

export interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  User: User | null;
}
