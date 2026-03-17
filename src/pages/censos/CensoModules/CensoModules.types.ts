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
  id: string;
  module: {
    id: string;
    name: string;
  };
  index: {
    id: string;
    name: string;
  };
}

export interface GetCensoModulesResponse {
  census: CensoInfo;
  indexes: IndexInfo[];
  modules: ModuleInfo[];
  selectedModules?: AssignedModule[];
}

export interface CensoModuleRow {
  module_id: string;
  module_name: string;
  checked: boolean;
  selected_index_id: string;
  encrypted_id: string | null;
  stored_index_id: string | null;
  stored_index_name: string | null;
  stored_index_encrypted_id: string | null;
  stored_index_plain_id: string | null;
}

export interface CensoModulesItemPayload {
  index_id: string;
  module_id: string;
}

export interface StoreCensoModulesPayload {
  census_id: string;  
  items: CensoModulesItemPayload[];
}

export interface UpdateCensoModulesPayload {
  items: CensoModulesItemPayload[];
}

export interface ApiMessageResponse {
  message: string;
}