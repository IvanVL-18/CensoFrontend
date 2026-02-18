// Catalogs.types.ts
export interface Catalog {
  id: string;
  name: string;
  slug: string;
  unit_id: string;
  unit_name?: string; 
  unit?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
export interface Unit {
  id: string;
  name: string;
}

export interface CreateCatalogDTO {
  name: string;
  slug: string;
  unit_id: string;
}

export type UpdateCatalogDTO = Partial<CreateCatalogDTO>;

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

export interface PaginatedCatalogsResponse {
  data: Catalog[];
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

// Catalogs.types.ts
export interface CatalogModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  initialSlug?: string;
  initialUnitId?: string;
  initialUnitName?: string; 
  units: Unit[];
  onClose: () => void;
  onSave: (name: string, slug: string, unitId: string) => void;
}

export interface CatalogsTableProps {
  Catalogs: Catalog[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Catalog) => void;
  onView: (Catalog: Catalog) => void;
  onEdit: (Catalog: Catalog) => void;
  onBan: (Catalog: Catalog) => void;
  onRestore: (Catalog: Catalog) => void;
  onDelete: (Catalog: Catalog) => void; 
}

export interface ViewCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  Catalog: Catalog | null;
}