

export interface Institution {
  id: string;
  name: string;
  municipality: string;
  geocode: string;
  typeinst: string;
  lat: number | null;
  lon: number | null;
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
  current_page: number;
  from: number;
  last_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedInstitutionsResponse {
  data: Institution[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface InstitutionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export interface InstitutionTableProps {
  institutions: Institution[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  onSort: (key: keyof Institution) => void;
  onShowMap: (institution: Institution) => void;
  onView: (institution: Institution) => void;
  onEdit?: (institution: Institution) => void;
  onBan?: (institution: Institution) => void;
  onRestore?: (institution: Institution) => void;
  onDelete?: (institution: Institution) => void;
}

export interface ViewInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution | null; 
}
export interface CreateInstitutionDTO {
  name: string;
  municipality: string;
  geocode: string;
  typeinst: string;
  lat?: number | null;
  lon?: number | null;

}
export type UpdateInstitutionDTO = Partial<CreateInstitutionDTO>;



