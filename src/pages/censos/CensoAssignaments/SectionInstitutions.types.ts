export interface SectionInfo {
  section_id: string;
  index: string;
  name: string;
}

export interface InstitutionItem {
  id: string;
  name: string;
  municipality?: string;
  geocode?: string;
  typeinst?: string;
}

export interface AssignmentItem {
  id: string;
  institution_id: string;
  name: string;
}

export interface GetSectionInstitutionsResponse {
  section: SectionInfo;
  assignments: AssignmentItem[];
  institutions: InstitutionItem[];
}

export interface StoreSectionInstitutionsPayload {
  census_section_id: string;
  items: { institution_id: string }[];
}

export interface UpdateSectionInstitutionsPayload {
  items: { institution_id: string }[];
}

export interface ApiMessageResponse {
  message: string;
}