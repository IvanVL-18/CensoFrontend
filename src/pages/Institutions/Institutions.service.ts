import api from "../../lib/Axios";
import type {
  Institution,
  PaginatedInstitutionsResponse,
  CreateInstitutionDTO,
  UpdateInstitutionDTO,
} from "../Institutions/institutions.types";

export type InstitutionFilter = "all" | "active" | "inactive";
//commit ivan v asfasf
type InstitutionId = string | number;


export const getInstitutions = async (
  filter: InstitutionFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedInstitutionsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedInstitutionsResponse>(
    `/institutions/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};

export const getInstitution = async (
  id: InstitutionId,
  signal?: AbortSignal,
): Promise<Institution> => {
  const response = await api.get<{ data: Institution } | Institution>(`/institutions/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createInstitution = async (
  unitData: CreateInstitutionDTO,
): Promise<{ message: string; data?: Institution }> => {
  const response = await api.post("/institutions", unitData);
  return response.data;
};

export const updateInstitution = async (
  id: InstitutionId,
  institutionData: UpdateInstitutionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/institutions/${id}`, institutionData);
  return response.data;
};

export const banInstitution = async (id: InstitutionId): Promise<{ message: string }> => {
  const response = await api.delete(`/institutions/${id}`);
  return response.data;
};

export const restoreInstitution = async (id: InstitutionId): Promise<{ message: string }> => {
  const response = await api.post(`/institutions/${id}/restore`);
  return response.data;
};

export const forceDeleteInstitution = async (
  id: InstitutionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/institutions/${id}/force-delete`);
  return response.data;
};

export const importInstitutions = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/units/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};





/* export const getInstitutions = (
  filter: InstitutionFilter = "all"
): Promise<PaginatedInstitutionsResponse> => {
  const url = `${API_URL}/institutions/${filter}/content`;

  return fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  }).then(handleJsonResponse);
};


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

export const updateInstitutionCoordinates = (
  id: string,
  coords: { lat: number; lon: number }
): Promise<any> => {
  const payload: UpdateInstitutionDTO = {
    lat: coords.lat,
    lon: coords.lon,
  };

  return updateInstitution(id, payload);
};




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

export const getInstitution = (id: string | number): Promise<Institution> => { 
  const url = `${API_URL}/institutions/${id}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "true", 
    },
  })
    .then(handleJsonResponse)
    .then((response) => {
      
      return response.data ?? response;
    })  
    .catch((error) => {
      console.error(`Error al obtener la unidad ${id}:`, error);
      throw error;
    });
}; */