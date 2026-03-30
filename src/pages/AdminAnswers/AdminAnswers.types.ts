export interface CensusRef {
  id: string;
  name: string;
}

export interface InstitutionRef {
  id: string;
  name: string;
}

export interface UserRef {
  id: string;
  name: string;
  lastname: string;
  email: string;
}

// GET /api/admin/censuses/{censusId}/institutions
export interface CensusInstitutionsResponse {
  census: CensusRef;
  institutions: InstitutionRef[];
}

// GET /api/admin/censuses/{censusId}/institutions/{institutionId}/users
export interface InstitutionUsersResponse {
  census: CensusRef;
  institution: InstitutionRef;
  users: UserRef[];
}

// GET .../users/{userId}/answers
export interface AnswerValue {
  id: string;
  answer: string;
}

export interface QuestionItem {
  id: string;
  index: string;
  name: string;
  instructions: string | null;
  question_structure: unknown;
  answer: AnswerValue | null;
}

export interface SectionItem {
  id: string;
  index: string;
  name: string;
  instructions: string | null;
  questions: QuestionItem[];
}

export interface ModuleItem {
  id: string;
  index: string;
  name: string;
  sections: SectionItem[];
}

export interface UserAnswersResponse {
  census: CensusRef;
  institution: InstitutionRef;
  user: UserRef;
  modules: ModuleItem[];
}
