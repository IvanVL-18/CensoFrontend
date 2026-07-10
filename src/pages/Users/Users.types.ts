export interface User {
  id: string;
  name: string ;
  lastname: string ;
  phone: string ;
  mobile: string ;
  address: string ;
  email: string;
  email_verified_at: string ;
  role_id: number;
  occupation_id: number ;
  dependency_id: number ;
  institution_id: number ;
  created_at: string;
  updated_at: string;
  deleted_at: string ;
  role?: { id: number; name: string };
  occupation?: { id: number; name: string };
  dependency?: { id: number; name: string };
  institution?: { id: number; name: string };
}

export interface MetaLink {
  url: string ;
  label: string;
  page: number ;
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
    first: string ;
    last: string ;
    prev: string ;
    next: string ;
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
  error: string ;
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

export interface UserModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string ;
  title: string;
  initialData?: User ;
  onClose: () => void;
  onSave: (data: CreateUserDTO) => void;
}

export interface UsersTableProps {
  Users: User[];
  meta: Meta ;
  loading: boolean;
  error: string ;
  onSort: (key: keyof User) => void;
  onView: (User: User) => void;
  onEdit?: (User: User) => void;
  onBan?: (User: User) => void;
  onRestore?: (User: User) => void;
  onDelete?: (User: User) => void;
}
export interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  User: User ;
}
export interface CreateUserDTO {
  name?: string ;
  lastname?: string ;
  phone?: string ;
  mobile?: string ;
  address?: string ;
  email: string;
  password?: string;
  password_confirmation?: string;
  role_id?: string | number;
  occupation_id?: string | number ;
  dependency_id?: string | number ;
  institution_id?: string | number ;
}
export type UpdateUserDTO = Partial<CreateUserDTO>;
