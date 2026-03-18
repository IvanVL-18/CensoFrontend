export interface question {
  id: string; 
  name: string;
  instructions: string | null; 
  commentaries: boolean | number; 
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

export interface PaginatedquestionsResponse {
  data: question[];
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

// DTOs para Crear/Editar
export interface CreatequestionDTO {
  name: string;
  instructions?: string;
  commentaries?: boolean;
}

export type UpdatequestionDTO = Partial<CreatequestionDTO>;

export interface questionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;          
  title: string;
  initialData?: question | null;
  onClose: () => void;
  onSave: (data: CreatequestionDTO) => void;
  onClearServerError: () => void; 
}

export interface questionsTableProps {
  questions: question[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof question) => void;
  onView: (question: question) => void;
  onEdit: (question: question) => void;
  onBan: (question: question) => void;
  onRestore: (question: question) => void;
  onDelete: (question: question) => void;
}

export interface ViewquestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: question | null; 
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