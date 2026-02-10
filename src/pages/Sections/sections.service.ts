import api from "../../lib/Axios";
import type {
  section,
  PaginatedSectionsResponse,
  CreatesectionDTO,
  UpdatesectionDTO,
} from "./Sections.types";

export type sectionFilter = "all" | "active" | "inactive";

type sectionId = string | number;



export const getSections = async (
  filter: sectionFilter = "all",
  search: string = "",
  page: number = 1,
  sortBy: string = "id",           
  direction: "asc" | "desc" = "asc", 
  signal?: AbortSignal,
): Promise<PaginatedSectionsResponse> => {
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  params.append("page", page.toString());
    params.append("sort_by", sortBy);
  params.append("direction", direction);

  const response = await api.get<PaginatedSectionsResponse>(
    `/Sections/${filter}/content`,
    {
      params: params,
      signal,
    },
  );
  return response.data;
};



export const getsection = async (
  id: sectionId,
  signal?: AbortSignal,
): Promise<section> => {
  const response = await api.get<{ data: section } | section>(`/Sections/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createsection = async (
  sectionData: CreatesectionDTO,
): Promise<{ message: string; data?: section }> => {
  const response = await api.post("/Sections", sectionData);
  return response.data;
};

export const updatesection = async (
  id: sectionId,
  sectionData: UpdatesectionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/Sections/${id}`, sectionData);
  return response.data;
};

export const bansection = async (id: sectionId): Promise<{ message: string }> => {
  const response = await api.delete(`/Sections/${id}`);
  return response.data;
};

export const restoresection = async (id: sectionId): Promise<{ message: string }> => {
  const response = await api.post(`/Sections/${id}/restore`);
  return response.data;
};

export const forceDeletesection = async (
  id: sectionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/Sections/${id}/force-delete`);
  return response.data;
};

export const importSections = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/Sections/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


