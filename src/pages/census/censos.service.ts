// src/services/censos.service.ts
import type { Census } from "../census/CensusCard"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
// ej: VITE_API_BASE_URL=http://192.168.1.90:8001/api

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
}

export interface PaginatedCensosResponse {
  data: Census[];
  meta: PaginationMeta;
}

/**
 * GET /censos o /censos/{content}/content
 */
export async function getCensuses(
  page = 1,
  search = ""
): Promise<PaginatedCensosResponse> {
  let url: string;

  if (search.trim()) {
    const encoded = encodeURIComponent(search.trim());
    url = `${API_BASE_URL}/censos/${encoded}/content?page=${page}`;
  } else {
    url = `${API_BASE_URL}/censos?page=${page}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al obtener los censos");
  }

  const json = await res.json();
  return json as PaginatedCensosResponse;
}

/**
 * POST /censos
 * Ajusta el payload a lo que pida tu CensoController@store.
 */
export async function createCensus(
  payload: Record<string, any>
): Promise<Census> {
  const res = await fetch(`${API_BASE_URL}/censos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(err);
    throw new Error("Error al crear el censo");
  }

  return (await res.json()) as Census;
}

export async function deleteCensus(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/censos/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar el censo");
  }
}

export async function restoreCensus(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/censos/${id}/restore`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error al restaurar el censo");
  }
}

export async function forceDeleteCensus(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/censos/${id}/force-delete`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar permanentemente el censo");
  }
}
