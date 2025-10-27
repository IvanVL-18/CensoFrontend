// src/pages/Units/units.interfaces.ts

// Esta es la interfaz para cada objeto 'Unit' dentro del array 'data'
export interface Unit {
  id: string; // Es un string encriptado
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string; // <-- CORRECCIÓN 1: '?' lo hace opcional (puede no existir)
}

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

// Esta es la interfaz para crear una nueva unidad
export interface CreateUnitDTO {
  name: string;
  // Agrega aquí otros campos que necesites para crear
}

// Esta es la interfaz para actualizar (opcional, pero útil)
// 'Partial' hace que todos los campos de CreateUnitDTO (como 'name') sean opcionales
export type UpdateUnitDTO = Partial<CreateUnitDTO>;