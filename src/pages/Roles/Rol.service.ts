import type {
  rol,
  PaginatedrolesResponse,
  CreaterolDTO,
  UpdaterolDTO,
} from "./Rol.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type rolFilter = "all" | "active" | "inactive";


const handleJsonResponse = async (response: Response) => {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Error al procesar respuesta del servidor: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    // Si hay error, lanzamos el mensaje que viene del back (Laravel)
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Retornamos toda la data (incluyendo el message y el code si existiera)
  return data;
};


export const getroles = (filter: rolFilter = "all"): Promise<PaginatedrolesResponse> => {
  const url = `${API_URL}/roles/${filter}/content`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

// Cambiamos Promise<void> por Promise<any> para recibir el { message: "..." }
export const banrol = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/roles/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const restorerol = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/roles/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleterol = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/roles/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

// Para crear y editar, Laravel devuelve el message. 
// Si necesitas el objeto rol, podrías ajustar el back o desestructurar aquí.
export const createrol = (rolData: CreaterolDTO): Promise<any> => {
  const url = `${API_URL}/roles`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(rolData),
  }).then(handleJsonResponse);
};

export const updaterol = (id: string, rolData: UpdaterolDTO): Promise<any> => {
  const url = `${API_URL}/roles/${id}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(rolData),
  }).then(handleJsonResponse);
};

export const getrol = (id: string | number): Promise<rol> => {
  const url = `${API_URL}/roles/${id}`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response);
};