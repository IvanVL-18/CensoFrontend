export type QuestionType = "empty" | "radio" | "check" | "selector";

export interface Option {
  id?: string;
  name: string;
}

export interface Question {
  id: string;
  name: string;
  commentaries: boolean;
  instructions: string | null;
  type: QuestionType;
  options?: Option[];
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

export interface CreateQuestionDTO {
  name: string;
  commentaries?: boolean | null;
  instructions?: string | null;
  type: QuestionType;
  options?: { name: string }[]; // requerido salvo type=empty
}

export type UpdateQuestionDTO = Partial<CreateQuestionDTO>;

export type QuestionFilter = "all" | "active" | "inactive";

export type SortConfig = {
  key: keyof Question;
  direction: "ascending" | "descending";
};

// ✅ INTERFACES DE PROPS (COMPONENTES)
// (Te las pidieron aquí, así que aquí van)

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

export interface QuestionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;

  initialData?: Partial<CreateQuestionDTO>;

  onClose: () => void;
  onSave: (payload: CreateQuestionDTO) => void;
}

export interface ViewQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
}

export interface QuestionsTableProps {
  questions: Question[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Question) => void;

  onView: (question: Question) => void;
  onEdit: (question: Question) => void;
  onBan: (question: Question) => void;
  onRestore: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export interface QuestionsToolbarProps {
  filter: QuestionFilter;
  searchTerm: string;
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
}
