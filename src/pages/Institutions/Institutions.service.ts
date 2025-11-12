import type {
  Unit,
  PaginatedUnitsResponse,
  CreateInstitutionDTO,
  UpdateUnitDTO,
} from "./Institutions.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type UnitFilter = "all" | "active" | "inactive";

// Función para manejar la respuesta JSON de la API
const handleJsonResponse = async (response: Response) => {
  const text = await response.text(); // Leer como texto por si no es JSON

  try {
    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(
        data.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    // Si JSON.parse falla, es probable que sea una página de error HTML del servidor.
    // En lugar de mostrar el HTML, lanzamos un error más genérico y amigable.
    console.error("La respuesta del servidor no es un JSON válido:", text.slice(0, 500));
    throw new Error("Error de validación del servidor. Revisa los datos enviados.");
  }
};

// Helper para manejar respuestas vacías (DELETE, RESTORE)
const handleEmptyResponse = async (response: Response) => {
  if (!response.ok) {
    await response.text();
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return;
};

// Obtener (GET) lista de units con filtro y paginación
export const getUnits = (
  filter: UnitFilter = "all"
): Promise<PaginatedUnitsResponse> => {
  const url = `${API_URL}/institutions/${filter}/content`;

  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(handleJsonResponse)
    .then((response) => {
      if (!response.data || response.data.length === 0) {
        throw new Error("No se encontraron instituciones.");
      }
      return response;
    })
    .catch((error) => {
      throw new Error(`Error al obtener las instituciones: ${error.message}`);
    });
};

// Crear (POST) una nueva unit
export const createUnit = (unitData: CreateInstitutionDTO): Promise<Unit> => {
  const url = `${API_URL}/institutions`;

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
      return response.data ?? response;
    })
    .catch((error) => {
      throw new Error(`Error al crear la institución: ${error.message}`);
    });
};

// Alias para saveUnit (si prefieres usar 'saveUnit' en vez de 'createUnit')
export const saveUnit = createUnit;

// Actualizar (PUT/PATCH) una unit existente
export const updateUnit = (
  id: string,
  unitData: UpdateUnitDTO
): Promise<Unit> => {
  const url = `${API_URL}/institutions/${id}`;

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
      throw new Error(`Error al actualizar la institución: ${error.message}`);
    });
};

// Borrar (DELETE) una unit (Soft Delete)
export const banUnit = (id: string): Promise<void> => {
  const url = `${API_URL}/institutions/${id}`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  })
    .then(handleEmptyResponse)
    .catch((error) => {
      throw new Error(`Error al desactivar la institución: ${error.message}`);
    });
};

// Restaurar (POST) una unit borrada
export const restoreUnit = (id: string): Promise<void> => {
  const url = `${API_URL}/institutions/${id}/restore`;

  return fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then(handleEmptyResponse)
    .catch((error) => {
      throw new Error(`Error al restaurar la institución: ${error.message}`);
    });
};

// Eliminar (DELETE) una unit (Force Delete)
export const forceDeleteUnit = (id: string | number): Promise<void> => {
  const url = `${API_URL}/institutions/${id}/force-delete`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  })
    .then(handleEmptyResponse)
    .catch((error) => {
      throw new Error(
        `Error al eliminar definitivamente la institución: ${error.message}`
      );
    });
};
