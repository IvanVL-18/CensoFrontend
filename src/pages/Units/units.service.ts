import type {
  Unit,
  PaginatedUnitsResponse,
  CreateUnitDTO,
  UpdateUnitDTO,
} from "./units.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type UnitFilter = "all" | "active" | "inactive";

/**
 * ⚙️ Helper para manejar respuestas JSON
 */
const handleJsonResponse = async (response: Response) => {
  const text = await response.text(); // leer como texto por si no es JSON

  try {
    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(
        data.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    // Lanzamos un error más descriptivo si el JSON falla
    throw new Error(
      `Respuesta no válida del servidor o no es JSON. Detalle: ${text.slice(
        0,
        200
      )}`
    );
  }
};

/**
 * ⚙️ Helper para manejar respuestas VACÍAS (DELETE, RESTORE)
 */
const handleEmptyResponse = async (response: Response) => {
  if (!response.ok) {
    // Consumimos el texto del error aunque no lo usemos, es buena práctica
    await response.text();
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  // Si la respuesta es ok (200, 204), simplemente retornamos void
  return;
};

/**
 * 📥 OBTENER (GET) lista de units con filtro y paginación
 */
export const getUnits = (
  filter: UnitFilter = "all"
): Promise<PaginatedUnitsResponse> => {
  const url = `${API_URL}/units/${filter}/content`;

  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true", // <-- LÍNEA AÑADIDA
    },
  })
    .then(handleJsonResponse)
    .catch((error) => {
      throw error;
    });
};

/**
 * ➕ CREAR (POST) una nueva unit
 */
export const createUnit = (unitData: CreateUnitDTO): Promise<Unit> => {
  const url = `${API_URL}/units`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(unitData),
  })
    .then(handleJsonResponse)
    .then((response) => {
      // Soporta si la API devuelve el objeto anidado en 'data' o directamente
      return response.data ?? response;
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * ✏️ ACTUALIZAR (PUT/PATCH) una unit existente
 */
export const updateUnit = (
  id: string,
  unitData: UpdateUnitDTO
): Promise<Unit> => {
  const url = `${API_URL}/units/${id}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(unitData),
  })
    .then(handleJsonResponse)
    .then((response) => {
      return response.data ?? response;
    })
    .catch((error) => {
      throw error;
    });
};

/**
 * 🗑️ BORRAR (DELETE) una unit (Soft Delete)
 */
export const banUnit = (id: string): Promise<void> => {
  const url = `${API_URL}/units/${id}`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true", 
    },
  })
    .then(handleEmptyResponse)
    .catch((error) => {
      throw error;
    });
};

/**
 * ♻️ RESTAURAR (POST) una unit borrada
 */
export const restoreUnit = (id: string): Promise<void> => {
  const url = `${API_URL}/units/${id}/restore`;

  return fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then(handleEmptyResponse)
    .catch((error) => {
      throw error;
    });
};

export const forceDeleteUnit = (id: string | number): Promise<void> => {
  const url = `${API_URL}/units/${id}/force-delete`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then(handleEmptyResponse)
    .catch((error) => {
      throw error;
    });
};
