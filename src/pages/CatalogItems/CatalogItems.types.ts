export interface CatalogItemCatalog {
  id: string | number | null;
  name: string | null;
}

export interface CatalogItem {
  id: string | number;
  value: string;
  label: string;
  catalog?: CatalogItemCatalog | null;
  catalog_name?: string | null;
  catalog_eid?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CatalogOption {
  id: string;
  name: string;
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

export interface PaginatedCatalogItemsResponse {
  data: CatalogItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface PaginatedCatalogOptionsResponse {
  data: Array<{
    id: string | number;
    name: string;
    deleted_at?: string | null;
  }>;
  meta: {
    current_page: number;
    last_page: number;
  };
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

export interface CatalogItemModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialValue?: string;
  initialLabel?: string;
  initialCatalogId?: string;
  initialCatalogName?: string;
  catalogs: CatalogOption[];
  onClose: () => void;
  onSave: (value: string, label: string, catalogId: string) => void;
  onClearServerError: () => void;
}

export interface CatalogItemsTableProps {
  catalogItems: CatalogItem[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof CatalogItem) => void;
  onView: (catalogItem: CatalogItem) => void;
  onEdit: (catalogItem: CatalogItem) => void;
  onBan: (catalogItem: CatalogItem) => void;
  onRestore: (catalogItem: CatalogItem) => void;
  onDelete: (catalogItem: CatalogItem) => void;
}

export interface ViewCatalogItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogItem: CatalogItem | null;
}

export interface CreateCatalogItemDTO {
  value: string;
  label: string;
  catalog_id: string;
}

export type UpdateCatalogItemDTO = Partial<CreateCatalogItemDTO>;
