import type {
  Section,
  PaginatedSectionsResponse,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "./Section.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type SectionFilter = "all" | "active" | "inactive";


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
 * 📥 OBTENER (GET) lista de Sections con filtro y paginación
 */
export const getSections = (
  filter: SectionFilter = "all"
): Promise<PaginatedSectionsResponse> => {
  const url = `${API_URL}/sections/${filter}/content`;

  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      //"ngrok-skip-browser-warning": "true", 
    },
  })
    .then(handleJsonResponse)
    .catch((error) => {
      throw error;
    });
};

/**
 * ➕ CREAR (POST) una nueva Section
 */
export const createSection = (SectionData: CreateSectionDTO): Promise<Section> => {
  const url = `${API_URL}/sections`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(SectionData),
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
 * ✏️ ACTUALIZAR (PUT/PATCH) una Section existente
 */
export const updateSection = (
  id: string,
  SectionData: UpdateSectionDTO
): Promise<Section> => {
  const url = `${API_URL}/sections/${id}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(SectionData),
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
 * 🗑️ BORRAR (DELETE) una Section (Soft Delete)
 */
export const banSection = (id: string): Promise<void> => {
  const url = `${API_URL}/sections/${id}`;

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
 * ♻️ RESTAURAR (POST) una Section borrada
 */
export const restoreSection = (id: string): Promise<void> => {
  const url = `${API_URL}/sections/${id}/restore`;

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

export const forceDeleteSection = (id: string | number): Promise<void> => {
  const url = `${API_URL}/sections/${id}/force-delete`;

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
