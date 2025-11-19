// src/pages/Sections/Sections.interfaces.ts

// Esta es la interfaz para cada objeto 'Section' dentro del array 'data'
export interface Section {
  id: string; // Es un string encriptado
  name: string;
  instructions: string | null; // <--- NUEVO CAMPO
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
export interface PaginatedSectionsResponse {
  data: Section[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Meta; // <-- CORRECCIÓN 2: Usamos la interfaz Meta corregida
}

// Esta es la interfaz para crear una nueva unidad
export interface CreateSectionDTO {
  name: string;
  instructions?: string | null;
}

// Esta es la interfaz para actualizar (opcional, pero útil)
// 'Partial' hace que todos los campos de CreateSectionDTO (como 'name') sean opcionales
export type UpdateSectionDTO = Partial<CreateSectionDTO>;