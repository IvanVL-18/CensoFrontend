export type ChartKind = "modulos";

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

/** Censo que se puede elegir. El id llega cifrado y cambia en cada respuesta: se sigue por nombre. */
export type CensusOption = {
  id: string;
  name: string;
  selected: boolean;
};

export type ChartApiData = {
  census: CensusInfo;
  censuses?: CensusOption[];
  modules: CensusModuleItem[];
};
