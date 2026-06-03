export interface Indicator {
  id: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
  instructions: string | null;
  indicator_name: string | null;
  attention: boolean | number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
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

export interface PaginatedSectionsResponse {
  data: Section[];
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

export interface SectionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialData?: CreateSectionDTO;
  onClose: () => void;
  onSave: (data: CreateSectionDTO) => void;
}

export interface SectionsTableProps {
  Sections: Section[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Section) => void;
  onView: (Section: Section) => void;
  onEdit?: (Section: Section) => void;
  onBan?: (Section: Section) => void;
  onRestore?: (Section: Section) => void;
  onDelete?: (Section: Section) => void;
}
export interface ViewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  Section: Section | null;
}
export interface CreateSectionDTO {
  name: string;
  instructions?: string | null;
  indicator_id?: string | null;
  attention?: boolean;
}
export type UpdateSectionDTO = Partial<CreateSectionDTO>;
