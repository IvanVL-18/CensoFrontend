// src/pages/area/Areas.interfaces.ts
export interface Institution {
  id: string;
  name: string;

  eid?: string | null;
  institution_eid?: string | null;
}

export interface Area {
  id: string;
  name: string;

  institution_id: string | null;
  institution_eid?: string | null;
  institution_name?: string | null;
  institution: Institution | null;
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

export interface PaginatedAreasResponse {
  data: Area[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface CreateAreaDTO {
  name: string;
  institution_id: string;
}

export type UpdateAreaDTO = Partial<CreateAreaDTO>;

export type AreaFilter = "all" | "active" | "inactive";
export type SortDirection = "ascending" | "descending";

export type SortConfig = {
  key: keyof Area | "institution_name";
  direction: SortDirection;
};

export interface AreaModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  initialInstitutionId?: string;
  institutions: Institution[];
  onClose: () => void;
  onSave: (name: string, institution_id: string) => void;
}

export interface AreasTableProps {
  areas: Area[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Area | "institution_name") => void;
  onView: (area: Area) => void;
  onEdit: (area: Area) => void;
  onBan: (area: Area) => void;
  onRestore: (area: Area) => void;
  onDelete: (area: Area) => void;
}

export interface AreasToolbarProps {
  filter: AreaFilter;
  searchTerm: string;
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
}

export type ConfirmButtonColor = "danger" | "primary";

export interface ConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonColor?: ConfirmButtonColor;
  onClose: () => void;
  onConfirm: () => void;
}

export interface FormErrorsProps {
  errors: string[];
}

export interface ViewAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: Area | null;
}
