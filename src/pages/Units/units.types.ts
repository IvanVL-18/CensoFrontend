export interface Unit {
  id: string | number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MetaLink {
  url: string | null;
  label: string;
  active: boolean;
  page?: number | null;
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

export interface PaginatedUnitsResponse {
  data: Unit[];
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

export interface UnitModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;

  onClearServerError: () => void;
}

export interface UnitsTableProps {
  units: Unit[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Unit) => void;
  onView: (unit: Unit) => void;
  onEdit: (unit: Unit) => void;
  onBan: (unit: Unit) => void;
  onRestore: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}

export interface ViewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit | null;
}

export interface CreateUnitDTO {
  name: string;
}

export type UpdateUnitDTO = Partial<CreateUnitDTO>;
