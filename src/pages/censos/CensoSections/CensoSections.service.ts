import api from "../../../lib/Axios";
import type {
  GetCensoSectionsResponse,
  StoreCensoSectionsPayload,
  UpdateCensoSectionsPayload,
  ApiMessageResponse,
  EncryptedCensusModuleId,
  GetAssignmentResponse,
  StoreAssignmentPayload,
  UpdateAssignmentPayload,
} from "./CensoSections.types";

export const getCensoSections = async (
  censusModuleId: EncryptedCensusModuleId,
  page: number = 1,
  signal?: AbortSignal,
): Promise<GetCensoSectionsResponse> => {
  const response = await api.get<GetCensoSectionsResponse>(
    `/census-section/${censusModuleId}`,
    {
      signal,
      params: { page },
    },
  );

  return response.data;
};

export const storeCensoSections = async (
  payload: StoreCensoSectionsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/census-section`,
    payload,
  );

  return response.data;
};

export const updateCensoSections = async (
  censusModuleId: EncryptedCensusModuleId,
  payload: UpdateCensoSectionsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/census-section/${censusModuleId}`,
    payload,
  );

  return response.data;
};

// ── Asignación de instituciones ───────────────────────────────────────────────

export const getAssignmentForCensus = async (
  censusSectionId: string,
  signal?: AbortSignal,
): Promise<GetAssignmentResponse> => {
  const response = await api.get<GetAssignmentResponse>(
    `/assignment-for-census/${censusSectionId}`,
    { signal },
  );
  return response.data;
};

export const storeAssignmentForCensus = async (
  payload: StoreAssignmentPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/assignment-for-census`,
    payload,
  );
  return response.data;
};

export const updateAssignmentForCensus = async (
  censusSectionId: string,
  payload: UpdateAssignmentPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.patch<ApiMessageResponse>(
    `/assignment-for-census/${censusSectionId}`,
    payload,
  );
  return response.data;
};
