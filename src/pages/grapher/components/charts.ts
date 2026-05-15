export type ChartKind = "modulos" | "censos";

export type CensusModuleItem = {
  id: number;
  module_id: number;
  module_name: string;
  questions_count: number;
};

export type ChartApiData = {
  census_id: number;
  modules: CensusModuleItem[];
};
