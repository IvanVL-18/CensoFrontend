export interface SectionInfo {
  section_id: string;
  index: string;
  name: string;
}

export interface InstitutionItem {
  id: string;
  name: string;
  // Se pueden mantener otros campos opcionales, pero no se usarán
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
  assignments: AssignmentItem[];
  institutions: InstitutionItem[];
}

export interface StoreSectionInstitutionsPayload {
  section_id: string;
  institutions: string[];
}

export interface ApiMessageResponse {
  message: string;
}