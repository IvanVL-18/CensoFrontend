export interface CensusModuleInfo {
  id: string;
  name: string;
}

export interface SectionIndexOption {
  id: string;
  name: string;
}

export interface SectionInfo {
  id: string;
  name: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationLinksObj {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedSectionsResponse {
  current_page: number;
  data: SectionInfo[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SelectedSectionItem {
  id: string;
  section: {
    id: string;
    name: string;
  };
  index: {
    id: string;
    name: string;
  };
}

export interface GetCensoSectionsResponse {
  censusModule: CensusModuleInfo;
  indexes: SectionIndexOption[];
  sections: PaginatedSectionsResponse;
  selectedSections: SelectedSectionItem[];
}

export interface CensoSectionRow {
  section_id: string;
  section_name: string;
  checked: boolean;
  selected_index_id: string;
  stored_index_name: string | null;
  census_section_id?: string;
}

export interface CensoSectionItemPayload {
  index_id: string;
  section_id: string;
}

export interface StoreCensoSectionsPayload {
  census_module_id: string;
  items: CensoSectionItemPayload[];
}

export interface UpdateCensoSectionItemPayload {
  census_section_id: string | null;
  index_id: string;
  section_id: string;
}

export interface UpdateCensoSectionsPayload {
  items: UpdateCensoSectionItemPayload[];
}

export interface ApiMessageResponse {
  message: string;
}