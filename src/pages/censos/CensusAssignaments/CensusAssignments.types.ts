
export interface CensusSectionInfo {
  section_id: string; 
  index: string;     
  name: string;      
}

export interface InstitutionOption {
  id: string;  
  name: string;
}

export interface AssignmentItem {
  id: string;           
  institution_id: string; 
  name: string;         
}


export interface GetCensusAssignmentsResponse {
  section: CensusSectionInfo;
  institutions: InstitutionOption[];
  assignments: AssignmentItem[];
}


export interface CensusAssignmentRow {
  institution_id: string;
  institution_name: string;
  checked: boolean; 
}


export interface AssignmentItemPayload {
  institution_id: string; 
}

export interface StoreCensusAssignmentsPayload {
  census_section_id: string; 
  items: AssignmentItemPayload[];
}

export interface UpdateCensusAssignmentsPayload {
  items: AssignmentItemPayload[];
}


export interface ApiMessageResponse {
  message: string;
}

export type EncryptedCensusSectionId = string;