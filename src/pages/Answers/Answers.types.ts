export interface MyCensus {
  id: string;
  name: string;
  description: string | null;
  init_date: string | null;
  deadline: string | null;
}

export interface MyCensusesResponse {
  censuses: MyCensus[];
}

export interface AnswerData {
  id: string;
  answer: string; // JSON string
}

export interface CensusQuestion {
  id: string;           // census_question_id cifrado
  index: string;
  name: string;
  instructions: string | null;
  commentaries: boolean;
  question_structure: any; // JSON schema de form.io
  answer: AnswerData | null;
}

export interface CensusSection {
  id: string;
  index: string;
  name: string;
  instructions: string | null;
  questions: CensusQuestion[];
}

export interface CensusModule {
  id: string;
  index: string;
  name: string;
  sections: CensusSection[];
}

export interface CensusDetailResponse {
  census: MyCensus;
  modules: CensusModule[];
}
