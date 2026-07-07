import api from "../../../lib/Axios";
import type {
  ImportPreviewResponse,
  ImportConfirmResponse,
  ImportUserOption,
  CensusOption,
} from "./ImportAnswers.types";

export const getCensuses = async (): Promise<CensusOption[]> => {
  const response = await api.get<{ data: CensusOption[] }>("/censuses");
  return response.data.data;
};

export const uploadImportPreview = async (
  censusId: string,
  file: File
): Promise<ImportPreviewResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("census_id", censusId);

  const response = await api.post<ImportPreviewResponse>(
    "/imports/answers/preview",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const confirmImport = async (
  batchId: string,
  userId: string
): Promise<ImportConfirmResponse> => {
  const response = await api.post<ImportConfirmResponse>(
    `/imports/answers/${batchId}/confirm`,
    { user_id: userId }
  );
  return response.data;
};

export const searchImportUsers = async (
  query: string
): Promise<ImportUserOption[]> => {
  const response = await api.get<{ users: ImportUserOption[] }>(
    "/imports/answers/users",
    { params: { q: query } }
  );
  return response.data.users;
};
