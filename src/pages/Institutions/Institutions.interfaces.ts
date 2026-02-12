// Este archivo define las estructuras de datos (interfaces) para el módulo de Instituciones.

/**
 * Representa una única institución, tal como viene de la API.
 */
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

/**
 * Define la estructura de los metadatos de paginación que vienen de Laravel.
 */
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

/**
 * Representa la respuesta completa de la API cuando se piden instituciones paginadas.
 */
export interface PaginatedInstitutionsResponse {
  data: Institution[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

/**
 * DTO (Data Transfer Object) para crear una nueva institución.
 * No incluye 'id', 'created_at', etc., porque son generados por el servidor.
 */
export type CreateInstitutionDTO = Omit<Institution, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

/**
 * DTO para actualizar una institución. Es similar a Create, pero puede ser parcial.
 * `Partial` hace que todas las propiedades sean opcionales.
 */
export type UpdateInstitutionDTO = Partial<CreateInstitutionDTO>;