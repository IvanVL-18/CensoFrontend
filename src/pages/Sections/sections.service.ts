import api from "../../lib/Axios";
import type {
  Section,
  Indicator,
  PaginatedSectionsResponse,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "./Sections.types";

export type SectionFilter = "all" | "active" | "inactive";

type SectionId = string | number;

export const getSections = async (
  filter: SectionFilter = "all",
  search: string = "",
  page: number = 1,
  _sortBy: string = "id",
  direction: "asc" | "desc" = "asc",
  signal?: AbortSignal,
): Promise<PaginatedSectionsResponse> => {
  const response = await api.post<PaginatedSectionsResponse>(
    `/sections/search`,
    {
      status: filter,
      content: search || undefined,
      order: direction,
    },
    {
      params: { page },
      signal,
    },
  );
  return response.data;
};

export const getSection = async (
  id: SectionId,
  signal?: AbortSignal,
): Promise<Section> => {
  const response = await api.get<{ data: Section } | Section>(
    `/sections/${id}`,
    {
      signal,
    },
  );
  return (response.data as any).data ?? response.data;
};

export const createSection = async (
  SectionData: CreateSectionDTO,
): Promise<{ message: string; data?: Section }> => {
  const response = await api.post("/sections", SectionData);
  return response.data;
};

export const updateSection = async (
  id: SectionId,
  SectionData: UpdateSectionDTO,
): Promise<{ message: string }> => {
  const response = await api.put(`/sections/${id}`, SectionData);
  return response.data;
};

export const banSection = async (
  id: SectionId,
): Promise<{ message: string }> => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

export const restoreSection = async (
  id: SectionId,
): Promise<{ message: string }> => {
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

export const getIndicators = async (): Promise<Indicator[]> => {
  const response = await api.get<{ data: Indicator[] }>(
    "/indicators/data/list",
  );
  return response.data.data;
};
