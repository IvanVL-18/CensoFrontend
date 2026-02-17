export interface User {
  id: string;

  name: string | null;
  lastname: string | null;
  phone: string | null;
  movil: string | null;
  address: string | null;

  email: string;
  role_id: string | null;
  occupation_id: string | null;

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
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
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

export type RoleOption = {
  label: string;
  value: string;
};

export type UserModalPayload = {
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
};

export interface CreateUserDTO {
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
}

export type UpdateUserDTO = {
  email: string;
  role_id: string;
  password?: string;
  password_confirmation?: string;
};

export type UserModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  error?: string | null;
  title: string;

  initialEmail?: string;
  initialPassword?: string;
  initialRoleId?: string;

  roles?: RoleOption[];

  onClose: () => void;
  onSave: (payload: UserModalPayload) => void;
};
