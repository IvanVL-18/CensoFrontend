export interface Censo {
  id: string;
  name: string;
  description?: string;        // 👈 nueva
  start_date?: string;         // 👈 nueva (normalizada desde init_date)
  end_date?: string;           // 👈 nueva (normalizada desde deadline)
  year?: number;               // 👈 nueva (opcional)
  created_at: string;
  updated_at: string;
  deleted_at: string;
  // ... otras propiedades que ya tengas

  // otros campos opcionales
  status?: string;
 
}

// DTOs para creación y actualización
export interface CreateCensoDTO {
  name: string;
  description?: string;
  init_date?: string;   // formato YYYY-MM-DD
  deadline?: string;    // formato YYYY-MM-DD
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
export interface CreateCensoDTO {
  name: string;
}
export type UpdateCensoDTO = Partial<CreateCensoDTO>;

