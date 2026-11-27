import api from "../../lib/Axios";
import type { TemplateQuestionDetail, WorkbookTemplateSummary } from "./Templates.types";

const workbookUrl = (code: string) => `/workbooks/${encodeURIComponent(code)}/template`;

/** El cuaderno con sus preguntas compiladas, sin las plantillas. */
export const getWorkbookTemplate = async (code: string, signal?: AbortSignal): Promise<WorkbookTemplateSummary> => {
  const response = await api.get<WorkbookTemplateSummary>(workbookUrl(code), { signal });
  return response.data;
};

/** Una pregunta con su plantilla y la de otra edición con la que se casó. */
export const getTemplateQuestion = async (id: number | string, signal?: AbortSignal): Promise<TemplateQuestionDetail> => {
  const response = await api.get<{ data: TemplateQuestionDetail }>(`/workbook-questions/${id}`, { signal });
  return response.data.data;
};

export const approveTemplateQuestion = async (id: number | string): Promise<TemplateQuestionDetail> => {
  const response = await api.post<{ data: TemplateQuestionDetail }>(`/workbook-questions/${id}/approve`);
  return response.data.data;
};

/** Aprueba las pendientes del cuaderno; «clean» deja fuera las que el compilador marcó como dudosas. */
export const approveWorkbookTemplate = async (code: string, scope: "clean" | "all"): Promise<WorkbookTemplateSummary> => {
  const response = await api.post<WorkbookTemplateSummary>(`${workbookUrl(code)}/approve`, { scope });
  return response.data;
};

/** Vuelve a intentar la compilación de un cuaderno que se quedó sin plantilla. */
export const compileWorkbookTemplate = async (code: string): Promise<WorkbookTemplateSummary> => {
  const response = await api.post<WorkbookTemplateSummary>(`${workbookUrl(code)}/compile`);
  return response.data;
};
