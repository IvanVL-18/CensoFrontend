import type { MetaLink } from "../censos/Censos.types";

export interface Censo {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  year?: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  status?: string;
  // Agregar estos para el diseño
  preguntas?: number;
  respuestas?: number;
  porcentaje?: number;
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

export interface PaginatedCensosResponse {
  data: Censo[];
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

export interface CensoModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export interface CensosTableProps {
  Censos: Censo[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Censo) => void;
  onView: (Censo: Censo) => void;
  onEdit: (Censo: Censo) => void;
  onBan: (Censo: Censo) => void;
  onRestore: (Censo: Censo) => void;
  onDelete: (Censo: Censo) => void;
}

export interface ViewCensoModalProps {
  isOpen: boolean;
  onClose: () => void;
  Censo: Censo | null;
}
