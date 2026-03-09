export interface SelectorOption {
  id: string;
  name: string;
}

export interface CensoInfo {
  id: string;
  name: string;
}

export interface IndexInfo {
  id: string;
  name: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
}

export interface AssignedModule {
  id: number;
  censo_id: number;
  index_id: number;
  reference_id: number;
  reference_type: string;
  encrypted_id: string;
  index: {
    id: number;
    name: string;
  };
  reference: {
    id: number;
    name: string;
  };
}

export interface GetCensoModulesResponse {
  censo: CensoInfo;
  indexs: IndexInfo[];
  modules: ModuleInfo[];
  indexForCensos?: AssignedModule[];
}

export interface CensoModuleRow {
  module_id: string;
  module_name: string;
  checked: boolean;
  selected_index_id: string;
  encrypted_id: string | null;

  stored_index_id: string | null;
  stored_index_name: string | null;
}

export interface CensoModulesItemPayload {
  index_id: string;
  module_id: string;
}

export interface StoreCensoModulesPayload {
  censo_id: string;
  items: CensoModulesItemPayload[];
}

export interface UpdateCensoModulesPayload {
  items: CensoModulesItemPayload[];
}

export interface ApiMessageResponse {
  message: string;
}