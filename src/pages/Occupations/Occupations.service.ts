import type {
  Occupation,
  PaginatedOccupationsResponse,
  CreateOccupationDTO,
  Institution,
  UpdateOccupationDTO,
} from "./Occupations.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type OccupationFilter = "all" | "active" | "inactive";


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
    .then((response) => {
      // Al igual que en create/update, manejamos si viene en .data
      return response.data ?? response;
    })  
    .catch((error) => {
      console.error(`Error al obtener la unidad ${id}:`, error);
      throw error;
    });
};

export const createOccupation = (occupationData: CreateOccupationDTO): Promise<Occupation> => {
  const url = `${API_URL}/occupations`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(occupationData),
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


export const updateOccupation = (
  id: string,
  occupationData: UpdateOccupationDTO
): Promise<Occupation> => {
  const url = `${API_URL}/occupations/${id}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(occupationData),
  })
    .then(handleJsonResponse)
    .then((response) => {
      return response.data ?? response;
    })
    .catch((error) => {
      throw error;
    });
};


export const banOccupation = (id: string): Promise<void> => {
  const url = `${API_URL}/occupations/${id}`;

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

export const restoreOccupation = (id: string): Promise<void> => {
  const url = `${API_URL}/occupations/${id}/restore`;

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

export const forceDeleteOccupation = (id: string | number): Promise<void> => {
  const url = `${API_URL}/occupations/${id}/force-delete`;

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

export const getInstitutions = (): Promise<Institution[]> => {
  const url = `${API_URL}/institutions`;

  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response) 
    .catch((error) => {
      throw error;
    });
};
