import api from "../../lib/Axios";
import type {
  Section,
  PaginatedSectionsResponse,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "./Sections.types";

export type SectionFilter = "all" | "active" | "inactive";
type SectionId = string | number;

export const getSections = async (
  filter: SectionFilter = "all",
  search: string = "",
  signal?: AbortSignal,
): Promise<PaginatedSectionsResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  
  const response = await api.get<PaginatedSectionsResponse>(
    `/sections/${filter}/content`,
    { params, signal }
  );
  return response.data;
};

export const getSection = async (
  id: SectionId,
  signal?: AbortSignal,
): Promise<Section> => {
  const response = await api.get<{ data: Section } | Section>(`/sections/${id}`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
};

export const createSection = async (
  sectionData: CreateSectionDTO,
): Promise<{ message: string; data?: Section }> => {
  const response = await api.post("/sections", sectionData);
  return response.data;
};

export const updateSection = async (
  id: SectionId,
  sectionData: UpdateSectionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/sections/${id}`, sectionData);
  return response.data;
};

export const deleteSection = async (id: SectionId): Promise<{ message: string }> => {
  const response = await api.delete(`/sections/${id}`); // Soft delete (ban)
  return response.data;
};

export const restoreSection = async (id: SectionId): Promise<{ message: string }> => {
  const response = await api.post(`/sections/${id}/restore`);
  return response.data;
};

export const forceDeleteSection = async (
  id: SectionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/sections/${id}/force-delete`);
  return response.data;
};

export const importSections = async (
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await api.post("/sections/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};