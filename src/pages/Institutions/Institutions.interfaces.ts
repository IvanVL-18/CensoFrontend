// src/pages/Units/units.interfaces.ts

// Esta es la interfaz para cada objeto 'Unit' dentro del array 'data'
// Asegúrate de que las propiedades de 'CreateInstitutionDTO' sean coherentes con las de 'Unit'
export interface Unit {
  id: string;
  name: string;
  municipality: string; // Agregado 'municipality'
  geocode: string; // Agregado 'geocode'
  typeinst: string; // Agregado 'typeinst'
  created_at: string;
  deleted_at: string | null;
}

// Interfaz para la creación de una unidad
// Asegúrate de que 'CreateInstitutionDTO' esté bien definida con todas las propiedades necesarias
export interface CreateInstitutionDTO {
  name: string;
  municipality: string;  // Asegúrate de que estas propiedades existan
  geocode: string;
  typeinst: string;
  // No se necesitan más propiedades para la creación según el DTO
}

// Para actualizar (opcional) podemos usar 'Partial'
export type UpdateUnitDTO = Partial<CreateInstitutionDTO>;


// --- Interaces para la paginación ---

// Esta es la interfaz para los links DENTRO del objeto 'meta'
export interface MetaLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

// Esta es la interfaz para el objeto 'meta' (ajustado a tu API)
export interface Meta {
  total: number[];
  per_page: number[];
  current_page: number[];
  last_page: number[];
  from: number;
  links: MetaLink[]; // <-- Faltaba este array de links
  path: string;
  to: number;
}

// Esta es la interfaz para la respuesta COMPLETA de la API (con paginación)
export interface PaginatedUnitsResponse {
  data: Unit[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta; // <-- CORRECCIÓN 2: Usamos la interfaz Meta corregida
}
