import api from "../../../lib/Axios";
import type {
  GetCensusAssignmentsResponse,
  StoreCensusAssignmentsPayload,
  UpdateCensusAssignmentsPayload,
  ApiMessageResponse,
  EncryptedCensusSectionId,
} from "./CensusAssignments.types";

export const getCensusAssignments = async (
  censusSectionId: EncryptedCensusSectionId,
  signal?: AbortSignal,
): Promise<GetCensusAssignmentsResponse> => {
  const response = await api.get<GetCensusAssignmentsResponse>(
    `/assignment-for-census/${censusSectionId}`,
    { signal },
  );
  return response.data;
};

export const storeCensusAssignments = async (
  payload: StoreCensusAssignmentsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/assignment-for-census`,
    payload,
  );
  return response.data;
};

export const updateCensusAssignments = async (
  censusSectionId: EncryptedCensusSectionId,
  payload: UpdateCensusAssignmentsPayload,
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/assignment-for-census/${censusSectionId}`,
    payload,
  );
  return response.data;
};
