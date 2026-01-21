import type {
  Unit,
  PaginatedUnitsResponse,
  CreateUnitDTO,
  UpdateUnitDTO,
} from "./units.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type UnitFilter = "all" | "active" | "inactive";


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


export const getUnits = (filter: UnitFilter = "all"): Promise<PaginatedUnitsResponse> => {
  const url = `${API_URL}/units/${filter}/content`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

// Cambiamos Promise<void> por Promise<any> para recibir el { message: "..." }
export const banUnit = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/units/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const restoreUnit = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/units/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteUnit = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/units/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

// Para crear y editar, Laravel devuelve el message. 
// Si necesitas el objeto Unit, podrías ajustar el back o desestructurar aquí.
export const createUnit = (unitData: CreateUnitDTO): Promise<any> => {
  const url = `${API_URL}/units`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(unitData),
  }).then(handleJsonResponse);
};

export const updateUnit = (id: string, unitData: UpdateUnitDTO): Promise<any> => {
  const url = `${API_URL}/units/${id}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(unitData),
  }).then(handleJsonResponse);
};

export const getUnit = (id: string | number): Promise<Unit> => {
  const url = `${API_URL}/units/${id}`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response);
};