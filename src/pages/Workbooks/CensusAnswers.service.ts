import { CanceledError } from "axios";
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

// Una sección puede tener decenas de preguntas y al imprimir se piden todas: van de pocas en
// pocas para no saturar al servidor.
const MAX_PARALLEL = 4;
let running = 0;
const waiting: (() => void)[] = [];

const acquire = (): Promise<void> =>
  new Promise((resolve) => {
    const start = () => {
      running++;
      resolve();
    };
    if (running < MAX_PARALLEL) start();
    else waiting.push(start);
  });

const release = (): void => {
  running--;
  waiting.shift()?.();
};

/** Lo que una institución respondió en una pregunta. Confidencial: exige workbook-answers.view. */
export const getQuestionAnswers = async (
  questionId: number,
  institution?: string,
  signal?: AbortSignal,
): Promise<QuestionAnswers> => {
  await acquire();
  try {
    // Pudo cancelarse mientras esperaba su turno (por ejemplo, al salir de la página).
    if (signal?.aborted) throw new CanceledError();
    const response = await api.get<{ data: QuestionAnswers }>(`/census-answers/questions/${questionId}`, {
      params: institution ? { institution } : undefined,
      signal,
    });
    return response.data.data;
  } finally {
    release();
  }
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
