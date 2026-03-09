import api from "../../../lib/Axios";
import type {
  GetCensoSectionsResponse,
  StoreCensoSectionsPayload,
  UpdateCensoSectionsPayload,
  ApiMessageResponse,
} from "./CensoSections.types";

type EncryptedModuleForCensoId = string;

export const getCensoSections = async (
  moduleForCensoId: EncryptedModuleForCensoId,
  signal?: AbortSignal,
): Promise<GetCensoSectionsResponse> => {
  const response = await api.get<GetCensoSectionsResponse>(
    `/section-for-censo/${moduleForCensoId}`,
    { signal },
  );

  return response.data;
};

export const storeCensoSections = async (
  payload: StoreCensoSectionsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/section-for-censo`,
    payload,
  );

  return response.data;
};

export const updateCensoSections = async (
  moduleForCensoId: EncryptedModuleForCensoId,
  payload: UpdateCensoSectionsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/section-for-censo/${moduleForCensoId}`,
    payload,
  );

  return response.data;
};