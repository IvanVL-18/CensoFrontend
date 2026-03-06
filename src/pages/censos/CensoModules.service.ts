import api from "../../lib/Axios";
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
    `/module-for-censo/${censoId}`,
    { signal },
  );

  return response.data;
};

export const storeCensoModules = async (
  payload: StoreCensoModulesPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/module-for-censo`,
    payload,
  );

  return response.data;
};

export const updateCensoModules = async (
  censoId: EncryptedCensoId,
  payload: UpdateCensoModulesPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/module-for-censo/${censoId}`,
    payload,
  );

  return response.data;
};