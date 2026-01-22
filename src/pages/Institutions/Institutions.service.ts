import type {
  PaginatedInstitutionsResponse,
  CreateInstitutionDTO,
  UpdateInstitutionDTO,
} from "./Institutions.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type InstitutionFilter = "all" | "active" | "inactive";

/**
 * 🛠️ Helper Unificado
 * Procesa la respuesta, maneja errores y extrae el 'message' de Laravel.
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
    // Si el backend manda un error, usamos su mensaje específico
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
};

// --- SERVICIOS ---

export const getInstitutions = (
  filter: InstitutionFilter = "all"
): Promise<PaginatedInstitutionsResponse> => {
  const url = `${API_URL}/institutions/${filter}/content`;

  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

// Cambiamos a Promise<any> para recibir el { message: "..." } al crear
export const createInstitution = (institutionData: CreateInstitutionDTO): Promise<any> => {
  const url = `${API_URL}/institutions`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(institutionData),
  }).then(handleJsonResponse);
};

export const saveInstitution = createInstitution;

export const updateInstitution = (
  id: string,
  InstitutionData: UpdateInstitutionDTO
): Promise<any> => {
  const url = `${API_URL}/institutions/${id}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(InstitutionData),
  }).then(handleJsonResponse);
};

// --- Acciones de Confirmación (Usan handleJsonResponse para el mensaje de éxito) ---

export const banInstitution = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/institutions/${id}`;

  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const restoreInstitution = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/institutions/${id}/restore`;

  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteInstitution = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/institutions/${id}/force-delete`;

  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};