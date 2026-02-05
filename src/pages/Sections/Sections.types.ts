import type { SectionFormData } from "./schemas/Sections.schema";

export interface Section {
  id: string;
  name: string;
  instructions?: string | null; 
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateSectionDTO {
  name: string;
  instructions?: string | null;
}

export interface UpdateSectionDTO extends Partial<CreateSectionDTO> {}

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

// Props de Componentes
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
  error?: string | null;
  title: string;
  initialName?: string;
  initialInstructions?: string; 
  onClose: () => void;
  onSave: (data: SectionFormData) => void; 
}

export interface SectionsTableProps {
  Sections: Section[]; 
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Section) => void;
  onView: (section: Section) => void;
  onEdit: (section: Section) => void;
  onBan: (section: Section) => void;
  onRestore: (section: Section) => void;
  onDelete: (section: Section) => void;
}

export interface ViewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
}

// ✅ (Opcional) Si no tienes los DTOs, agrégalos también:
export interface CreateSectionDTO {
  name: string;
  instructions?: string | null;
}

export interface UpdateSectionDTO extends Partial<CreateSectionDTO> {}