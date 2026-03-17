import api from "../../../lib/Axios";
import type {
  GetCensoModulesResponse,
  StoreCensoModulesPayload,
  UpdateCensoModulesPayload,
  ApiMessageResponse,
} from "./CensoModules.types";

type EncryptedCensoId = string;

export const getCensoModules = async (
  censoId: EncryptedCensoId,
  signal?: AbortSignal,
): Promise<GetCensoModulesResponse> => {
  const response = await api.get<GetCensoModulesResponse>(
    `/census-module/${censoId}`,
    { signal },
  );

  return response.data;
};

export const storeCensoModules = async (
  payload: StoreCensoModulesPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/census-module`,
    payload,
  );

  return response.data;
};

export const updateCensoModules = async (
  censoId: EncryptedCensoId,
  payload: UpdateCensoModulesPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/census-module/${censoId}`,
    payload,
  );

  return response.data;
};
