import type {
  Index,
  PaginatedIndexsResponse,
  CreateIndexDTO,
  UpdateIndexDTO,
  IndexFilter,
} from "./indexs.interfaces";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export type { IndexFilter };


const handleJsonResponse = async (response: Response) => {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Error al procesar respuesta del servidor: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
  }

  return data;
};


export const getIndexs = (filter: IndexFilter = "all"): Promise<PaginatedIndexsResponse> => {
  const url = `${API_URL}/index/${filter}/content`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const getSingleIndex = (id: string): Promise<Index> => {
  const url = `${API_URL}/index/${id}`;
  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  })
    .then(handleJsonResponse)
    .then((response) => response.data ?? response);
};

export const createIndex = (indexData: CreateIndexDTO): Promise<any> => {
  const url = `${API_URL}/index`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(indexData),
  }).then(handleJsonResponse);
};

export const updateIndex = (id: string, indexData: UpdateIndexDTO): Promise<any> => {
  const url = `${API_URL}/index/${id}`;
  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(indexData),
  }).then(handleJsonResponse);
};


export const banIndex = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/index/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const restoreIndex = (id: string): Promise<{ message: string }> => {
  const url = `${API_URL}/index/${id}/restore`;
  return fetch(url, {
    method: "POST",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const forceDeleteIndex = (id: string | number): Promise<{ message: string }> => {
  const url = `${API_URL}/index/${id}/force-delete`;
  return fetch(url, {
    method: "DELETE",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};

export const importIndexs = async (
  formData: FormData
): Promise<{ message: string }> => {
  const url = `${API_URL}/index/import`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    
    if (response.status === 422 && data.errors) {
      const error: any = new Error(data.message || "Errores en el archivo");
      error.bulkErrors = data.errors; 
      throw error;
    }
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
};