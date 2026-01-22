import type {
  Section,
  PaginatedSectionsResponse,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "./Section.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type SectionFilter = "all" | "active" | "inactive";

/**
 * 🛠️ Helper Unificado
 * Procesa la respuesta, maneja errores de parseo y extrae mensajes de Laravel.
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
    // Captura el mensaje de error definido en tu controlador de Laravel
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
};

// --- SERVICIOS ---

export const getSections = (filter: SectionFilter = "all"): Promise<PaginatedSectionsResponse> => {
  const url = `${API_URL}/sections/${filter}/content`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const getSection = (id: string | number): Promise<Section> => {
  const url = `${API_URL}/sections/${id}`;
  return fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response);
};

// Se cambia Promise<Section> por Promise<any> para poder leer el 'message' de éxito
export const createSection = (SectionData: CreateSectionDTO): Promise<any> => {
  const url = `${API_URL}/sections`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(SectionData),
  }).then(handleJsonResponse);
};

export const updateSection = (id: string, SectionData: UpdateSectionDTO): Promise<any> => {
  const url = `${API_URL}/sections/${id}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(SectionData),
  }).then(handleJsonResponse);
};

// Eliminamos handleEmptyResponse y usamos handleJsonResponse para capturar el mensaje
export const banSection = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/sections/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  }).then(handleJsonResponse);
};

export const restoreSection = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/sections/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteSection = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/sections/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  }).then(handleJsonResponse);
};