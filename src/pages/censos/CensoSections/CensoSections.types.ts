export interface ModuleSectionInfo {
  module_id: string;
  module_name: string;
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
  section_for_censo_id: string;
  section: {
    section_id: string;
    name: string;
  };
  index: {
    index_id: string;
    name: string;
  };
}

export interface GetCensoSectionsResponse {
  module: ModuleSectionInfo;
  indexs: SectionIndexOption[];
  sections: PaginatedSectionsResponse;
  sectionsSelected: SelectedSectionItem[];
}

export interface CensoSectionRow {
  section_id: string;
  section_name: string;
  checked: boolean;
  selected_index_id: string;
  stored_index_name: string | null;
}

export interface CensoSectionItemPayload {
  index_id: string;
  section_id: string;
}

export interface StoreCensoSectionsPayload {
  module_id: string;
  items: CensoSectionItemPayload[];
}

export interface UpdateCensoSectionsPayload {
  items: CensoSectionItemPayload[];
}

export interface ApiMessageResponse {
  message: string;
}