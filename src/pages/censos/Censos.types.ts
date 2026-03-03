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
}

export interface CreateCensoDTO {
  name: string;
  description?: string;
  init_date?: string;
  deadline?: string;
}

export type UpdateCensoDTO = Partial<CreateCensoDTO>;

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

export interface Index {
  id: string | number;
  name: string;  // El nombre del índice (ej. "1.1.2")
}

// Tipos existentes (Censo, Index, etc.) se mantienen

export interface Module {
  id: number;
  name: string;
  // otros campos que tenga el modelo Module
}

export interface IndexForCenso {
  id: number;
  index_id: number;
  reference_id: number;  // ID del módulo (unit)
  reference_type: string;
  // opcionalmente puedes incluir relaciones
  index?: Index;
  reference?: Module;
}

// Respuesta del endpoint show
export interface ModuleForCensoShowResponse {
  censo: {
    id: string;
    name: string;
  };
  indexs: Index[];        // lista de índices numéricos
  modules: Module[];       // todos los módulos (si se necesitan)
  indexForCensos?: IndexForCenso[];  // asignaciones existentes
}

// Cuerpo de la petición para store/update
export interface ModuleForCensoRequest {
  items: Array<{
    module_id: number;
    index_id: number;
  }>;
}