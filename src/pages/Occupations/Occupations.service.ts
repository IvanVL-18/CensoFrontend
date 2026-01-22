import type {
  Occupation,
  PaginatedOccupationsResponse,
  CreateOccupationDTO,
  Institution,
  UpdateOccupationDTO,
} from "./Occupations.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type OccupationFilter = "all" | "active" | "inactive";

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
    // Captura el mensaje de error definido en tu controlador de Laravel (message)
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
};

/**
 * 📥 OBTENER (GET) lista de occupations con filtro y paginación
 */
export const getOccupations = (
  filter: OccupationFilter = "all",
  sortConfig: { key: string; direction: string }
): Promise<PaginatedOccupationsResponse> => {
  const params = new URLSearchParams({
    sort: sortConfig.key,
    dir: sortConfig.direction === 'ascending' ? 'asc' : 'desc',
  });

  const url = `${API_URL}/occupations/${filter}/content?${params.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const getOccupation = (id: string | number): Promise<Occupation> => { 
  const url = `${API_URL}/occupations/${id}`;

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

// Cambiamos a Promise<any> para recibir el { message: "..." } del back
export const createOccupation = (occupationData: CreateOccupationDTO): Promise<any> => {
  const url = `${API_URL}/occupations`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(occupationData),
  }).then(handleJsonResponse);
};

export const updateOccupation = (id: string, occupationData: UpdateOccupationDTO): Promise<any> => {
  const url = `${API_URL}/occupations/${id}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(occupationData),
  }).then(handleJsonResponse);
};

// --- Acciones de Confirmación (Ahora retornan el JSON con el mensaje) ---

export const banOccupation = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/occupations/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const restoreOccupation = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/occupations/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteOccupation = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/occupations/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const getInstitutions = (): Promise<Institution[]> => {
  const url = `${API_URL}/institutions`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response);
};