export interface Question {
  id: string; // El backend devuelve un ID encriptado (string)
  name: string;
  instructions: string | null; // Nuevo campo según migración
  commentaries: boolean | number; // Nuevo campo (puede venir como 1/0 o true/false)
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
  to: number;
  links: MetaLink[];
  path: string;
}

export interface PaginatedQuestionsResponse {
  data: Question[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

// Para el manejo de errores de Excel (sin cambios)
export interface ExcelFailure {
  row: number;
  field: string;
  errors: string[];
  invalid_value: any;
}

// DTOs para Crear/Editar
export interface CreateQuestionDTO {
  name: string;
  instructions?: string;
  commentaries?: boolean;
}

export type UpdateQuestionDTO = Partial<CreateQuestionDTO>;

// Props de Modales (sin cambios mayores)
export interface QuestionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialData?: Question | null; // Cambié initialName por initialData para cargar todo
  onClose: () => void;
  onSave: (data: CreateQuestionDTO) => void; // Ahora recibe un objeto completo
}

export interface QuestionsTableProps {
  Questions: Question[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Question) => void;
  onView: (Question: Question) => void;
  onEdit: (Question: Question) => void;
  onBan: (Question: Question) => void;
  onRestore: (Question: Question) => void;
  onDelete: (Question: Question) => void;
}

export interface ViewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  Question: Question | null; 
}
export interface FormErrorsProps {
  errors: string[];
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