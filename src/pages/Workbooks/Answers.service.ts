import api from "../../lib/Axios";
import type {
  AnswerQuestionDetail,
  FileAnswersPreview,
  ImportReport,
  InstitutionOptions,
} from "./Answers.types";
import type { WorkbookFileDetail } from "./Workbooks.types";

const fileUrl = (id: string) => `/workbook-files/${id}`;

/** Vista previa de lo extraído de un archivo, por pregunta: conteos y avisos, sin valores. */
export const getFileAnswers = async (id: string, signal?: AbortSignal): Promise<FileAnswersPreview> => {
  const response = await api.get<FileAnswersPreview>(`${fileUrl(id)}/answers`, { signal });
  return response.data;
};

/** Los valores de una pregunta. Respuestas confidenciales: exige workbook-answers.view. */
export const getFileAnswer = async (
  id: string,
  questionId: number | string,
  signal?: AbortSignal,
): Promise<AnswerQuestionDetail> => {
  const response = await api.get<{ data: AnswerQuestionDetail }>(`${fileUrl(id)}/answers/${questionId}`, { signal });
  return response.data.data;
};

/** Una persona confirma y las respuestas del archivo pasan a ser las del censo. */
export const importFileAnswers = async (id: string): Promise<{ report: ImportReport; data: WorkbookFileDetail }> => {
  const response = await api.post<{ report: ImportReport; data: WorkbookFileDetail }>(`${fileUrl(id)}/answers/import`);
  return response.data;
};

/** Vuelve a leer las respuestas del archivo (queda en la cola). */
export const extractFileAnswers = async (id: string): Promise<WorkbookFileDetail> => {
  const response = await api.post<{ data: WorkbookFileDetail }>(`${fileUrl(id)}/answers/extract`);
  return response.data.data;
};

export const getInstitutionOptions = async (
  id: string,
  search: string,
  signal?: AbortSignal,
): Promise<InstitutionOptions> => {
  const response = await api.get<InstitutionOptions>(`${fileUrl(id)}/institution-options`, {
    params: search ? { search } : undefined,
    signal,
  });
  return response.data;
};

/** Liga el archivo con una institución del catálogo; con `remember`, el nombre declarado queda como alias. */
export const assignInstitution = async (
  id: string,
  institutionId: string,
  remember: boolean,
): Promise<{ linked: number; data: WorkbookFileDetail }> => {
  const response = await api.post<{ linked: number; data: WorkbookFileDetail }>(`${fileUrl(id)}/institution`, {
    institution_id: institutionId,
    remember,
  });
  return response.data;
};
