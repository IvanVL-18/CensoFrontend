export interface Question {
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

export interface QuestionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;          
  title: string;
  initialData?: Question | null;
  onClose: () => void;
  onSave: (data: CreateQuestionDTO) => void;
  onClearServerError: () => void; 
}

export interface QuestionsTableProps {
  Questions: Question[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Question) => void;
  onView: (Question: Question) => void;
  onEdit?: (Question: Question) => void;
  onBan?: (Question: Question) => void;
  onRestore?: (Question: Question) => void;
  onDelete?: (Question: Question) => void;
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