import type {
  Index,
  PaginatedIndexsResponse,
  CreateIndexDTO,
  UpdateIndexDTO,
} from "./indexs.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type IndexFilter = "all" | "active" | "inactive";

/**
 * 🛠️ Helper Unificado
 * Procesa la respuesta y extrae el 'message' de Laravel tanto en éxito como en error.
 */
const handleJsonResponse = async (response: Response) => {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Error al procesar respuesta del servidor: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    // Si Laravel devuelve un error (400, 422, etc.), lanzamos su mensaje
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
};

// --- SERVICIOS ---

export const getIndexs = (filter: IndexFilter = "all"): Promise<PaginatedIndexsResponse> => {
  const url = `${API_URL}/index/${filter}/content`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const getSingleIndex = (id: string): Promise<Index> => {
  const url = `${API_URL}/index/${id}`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response);
};

// Cambiamos a Promise<any> para capturar el message de "Índice creado con éxito"
export const createIndex = (indexData: CreateIndexDTO): Promise<any> => {
  const url = `${API_URL}/index`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(indexData),
  }).then(handleJsonResponse);
};

export const updateIndex = (id: string, indexData: UpdateIndexDTO): Promise<any> => {
  const url = `${API_URL}/index/${id}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(indexData),
  }).then(handleJsonResponse);
};

// --- Acciones de Confirmación (Ahora retornan el JSON con el mensaje) ---

export const banIndex = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/index/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const restoreIndex = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/index/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteIndex = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/index/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};