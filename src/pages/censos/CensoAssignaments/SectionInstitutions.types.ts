// SectionInstitutions.types.ts
export interface SectionInfo {
  section_id: string;
  index: string;          // nombre del índice (o podrías tener un objeto)
  name: string;
}

export interface InstitutionItem {
  id: string;             // asumo string, pero puede ser number; lo normalizamos
  name: string;
  municipality?: string;
  geocode?: string;
  typeinst?: string;
}

export interface AssignmentItem {
  id: number;
  institution_id: number;
  index_for_censo_id: number;
  created_at: string;
  updated_at: string;
}

export interface GetSectionInstitutionsResponse {
  section: SectionInfo;
  assigments: AssignmentItem[];   // con una 's'
  institutions: InstitutionItem[];
}
export interface StoreSectionInstitutionsPayload {
  section_id: string;
  institutions: string[];   // solo IDs de instituciones
}

export interface ApiMessageResponse {
  message: string;
}