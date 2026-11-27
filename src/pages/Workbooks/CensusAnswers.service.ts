import api from "../../lib/Axios";
import type {
  AnswersEdition,
  AnswersOverview,
  QuestionAnswers,
  SectionAnswers,
  SectionBundle,
} from "./CensusAnswers.types";

const censusUrl = (program: string, year: number) => `/census-answers/${encodeURIComponent(program)}/${year}`;
const sectionUrl = (program: string, year: number, index: string) =>
  `${censusUrl(program, year)}/sections/${encodeURIComponent(index)}`;

/** Censos armados desde cuadernos, el más reciente primero. */
export const getAnswersEditions = async (signal?: AbortSignal): Promise<AnswersEdition[]> => {
  const response = await api.get<{ data: AnswersEdition[] }>("/census-answers", { signal });
  return response.data.data;
};

/** Módulos y secciones de un censo, con quién contestó cada sección. */
export const getAnswersOverview = async (program: string, year: number, signal?: AbortSignal): Promise<AnswersOverview> => {
  const response = await api.get<AnswersOverview>(censusUrl(program, year), { signal });
  return response.data;
};

/** Preguntas de una sección y cuáles contestó la institución. Sin valores. */
export const getSectionAnswers = async (
  program: string,
  year: number,
  index: string,
  institution?: string,
  signal?: AbortSignal,
): Promise<SectionAnswers> => {
  const response = await api.get<SectionAnswers>(sectionUrl(program, year, index), {
    params: institution ? { institution } : undefined,
    signal,
  });
  return response.data;
};

/** Lo que una institución respondió en una pregunta. Confidencial: exige workbook-answers.view. */
export const getQuestionAnswers = async (
  questionId: number,
  institution?: string,
  signal?: AbortSignal,
): Promise<QuestionAnswers> => {
  const response = await api.get<{ data: QuestionAnswers }>(`/census-answers/questions/${questionId}`, {
    params: institution ? { institution } : undefined,
    signal,
  });
  return response.data.data;
};

/** Todas las respuestas de la sección de una vez, para exportarlas. Confidencial. */
export const getSectionBundle = async (
  program: string,
  year: number,
  index: string,
  institution?: string,
): Promise<SectionBundle> => {
  const response = await api.get<SectionBundle>(`${sectionUrl(program, year, index)}/answers`, {
    params: institution ? { institution } : undefined,
  });
  return response.data;
};
