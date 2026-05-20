export type ChartKind = "modulos" | "censos";

export type CensusModuleItem = {
  module_name: string;
  questions_count: number;
};

export type CensusInfo = {
  id: string;
  name: string;
  description: string;
  init_date: string;
  deadline: string;
  created_at: string;
  updated_at: string;
};

export type ChartApiData = {
  census: CensusInfo;
  modules: CensusModuleItem[];
};
