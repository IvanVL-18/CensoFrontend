

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
  deleted_at: string | null; // Puede ser null si la institución está activa
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
  onShowMap: (institution: Institution) => void; /* revisar si no sirve el mapa */
  onView: (institution: Institution) => void;
  onEdit: (institution: Institution) => void;
  onBan: (institution: Institution) => void;
  onRestore: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
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



/* export interface PaginatedInstitutionsResponse {
  data: Institution[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
} */

/**
 * DTO (Data Transfer Object) para crear una nueva institución.
 * No incluye 'id', 'created_at', etc., porque son generados por el servidor.
 */
/* export type CreateInstitutionDTO = Omit<Institution, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>; */

/**
 * DTO para actualizar una institución. Es similar a Create, pero puede ser parcial.
 * `Partial` hace que todas las propiedades sean opcionales.
 */
/* export type UpdateInstitutionDTO = Partial<CreateInstitutionDTO>; */