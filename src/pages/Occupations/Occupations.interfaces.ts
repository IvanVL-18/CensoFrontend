// src/pages/Occupations/occupations.interfaces.ts

// Esta es la interfaz para cada objeto 'occupation' dentro del array 'data'
export interface Occupation {
  id: string; // Es un string encriptado
  name: string;
  // <--- CAMBIO: La institución ahora es un objeto anidado
  institution: {
    id: string;
    name: string;
  } | null; // Puede ser nulo si no tiene institución
  institution_id?: string; // Lo mantenemos opcional para compatibilidad interna
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // Puede ser nulo
}

// Interfaz para una Institución
export interface Institution {
  id: string;
  name: string;
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
export interface PaginatedOccupationsResponse {
  data: Occupation[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta; // <-- CORRECCIÓN 2: Usamos la interfaz Meta corregida
}

// Esta es la interfaz para crear una nueva unidad
export interface CreateOccupationDTO {
  name: string;
  institution_id: string;
  // Agrega aquí otros campos que necesites para crear
}

// Esta es la interfaz para actualizar (opcional, pero útil)
// 'Partial' hace que todos los campos de CreateOccupationDTO (como 'name') sean opcionales
export type UpdateOccupationDTO = Partial<CreateOccupationDTO>;