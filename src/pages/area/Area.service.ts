import type {
  Area,
  PaginatedAreasResponse,
  CreateAreaDTO,
  Institution,
  UpdateAreaDTO,
  AreaFilter,
  SortConfig,
} from "./Areas.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const handleJsonResponse = async (response: Response) => {
  const text = await response.text();
  let data: any; 

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Error al procesar respuesta: ${text.slice(0, 120)}`);
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
};

export const getAreas = (
  filter: AreaFilter = "all",
  sortConfig: SortConfig,
  page: number = 1
): Promise<PaginatedAreasResponse> => {
  const params = new URLSearchParams({
    sort: String(sortConfig.key),
    dir: sortConfig.direction === "ascending" ? "asc" : "desc",
    page: String(page),
  });

  const url = `${API_URL}/area/${filter}/content?${params.toString()}`;

  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const getArea = (id: string | number): Promise<Area> => {
  const url = `${API_URL}/area/${id}`;

  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  })
    .then(handleJsonResponse)
    .then((response) => (response.data ?? response) as Area);
};

export const createArea = (areaData: CreateAreaDTO): Promise<any> => {
  const url = `${API_URL}/area`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(areaData),
  }).then(handleJsonResponse);
};

export const updateArea = (id: string, areaData: UpdateAreaDTO): Promise<any> => {
  const url = `${API_URL}/area/${id}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(areaData),
  }).then(handleJsonResponse);
};

export const banArea = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/area/${id}`;

  return fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const restoreArea = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/area/${id}/restore`;

  return fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteArea = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/area/${id}/force-delete`;

  return fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  }).then(handleJsonResponse);
};

export const getInstitutions = (): Promise<Institution[]> => {
  const url = `${API_URL}/institutions`;

  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  })
    .then(handleJsonResponse)
    .then((response) => (response.data ?? response) as Institution[]);
};
