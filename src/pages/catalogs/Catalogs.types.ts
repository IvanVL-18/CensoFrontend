// Catalogs.types.ts
export interface Catalog {
  id: string;
  name: string;
  slug: string;
  module_id: string;
  Module_name?: string; 
   Module_is_active?: boolean; 
  Module?: {
    id: string;
    name: string;
     deleted_at?: string | null;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
export interface Module {
  id: string;
  name: string;
  deleted_at?: string | null;
}

export interface CreateCatalogDTO {
  name: string;
  slug: string;
  module_id: string;
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

export interface CatalogModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  initialSlug?: string;
  initialModuleId?: string;
  initialModuleName?: string; 
  Modules: Module[];
  onClose: () => void;
  onSave: (name: string, slug: string, ModuleId: string) => void;
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