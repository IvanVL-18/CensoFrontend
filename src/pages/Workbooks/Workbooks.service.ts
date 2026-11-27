import api from "../../lib/Axios";
import type {
  Informant,
  ProgressResponse,
  WorkbookFile,
  WorkbookFileDetail,
  WorkbookFileFilter,
  WorkbookFilesPage,
} from "./Workbooks.types";

/** Igual que StoreWorkbookFilesRequest del backend. */
export const MAX_FILE_SIZE_MB = 20;
export const ACCEPTED_EXTENSIONS = [".xlsx", ".xlsm"];

/** Sube un archivo. La pantalla manda uno por petición para mostrar el avance de cada uno. */
export const uploadWorkbookFile = async (
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<WorkbookFile> => {
  const formData = new FormData();
  formData.append("files[]", file);

  const response = await api.post<{ data: WorkbookFile[] }>(
    "/workbook-files",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    },
  );
  return response.data.data[0];
};

export const searchWorkbookFiles = async (
  params: { status: WorkbookFileFilter; search: string; page: number },
  signal?: AbortSignal,
): Promise<WorkbookFilesPage> => {
  const response = await api.post<WorkbookFilesPage>(
    "/workbook-files/search",
    {
      status: params.status,
      search: params.search || undefined,
      order: "desc",
    },
    { params: { page: params.page }, signal },
  );
  return response.data;
};

export const getWorkbookFile = async (
  id: string,
  signal?: AbortSignal,
): Promise<WorkbookFileDetail> => {
  const response = await api.get<{ data: WorkbookFileDetail }>(
    `/workbook-files/${id}`,
    { signal },
  );
  return response.data.data;
};

export const retryWorkbookFile = async (id: string): Promise<WorkbookFileDetail> => {
  const response = await api.post<{ data: WorkbookFileDetail }>(
    `/workbook-files/${id}/retry`,
  );
  return response.data.data;
};

/** Contactos de los informantes: datos personales, exige informants.view. */
export const getWorkbookInformants = async (
  id: string,
  signal?: AbortSignal,
): Promise<Informant[]> => {
  const response = await api.get<{ data: Informant[] }>(
    `/workbook-files/${id}/informants`,
    { signal },
  );
  return response.data.data;
};

export const getWorkbookProgress = async (
  edition: { program: string; year: number } | null,
  signal?: AbortSignal,
): Promise<ProgressResponse> => {
  const response = await api.get<ProgressResponse>("/workbooks/progress", {
    params: edition ?? undefined,
    signal,
  });
  return response.data;
};

/** Mensaje legible de un error de la API (el interceptor copia data y message). */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as {
    data?: { message?: string; errors?: Record<string, string[]> };
    message?: string;
  };
  const fieldErrors = err?.data?.errors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const first = Object.values(fieldErrors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return err?.data?.message ?? fallback;
};

export const isCanceled = (error: unknown): boolean => {
  const err = error as { name?: string; code?: string };
  return err?.name === "CanceledError" || err?.code === "ERR_CANCELED";
};
