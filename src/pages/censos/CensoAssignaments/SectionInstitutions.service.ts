import api from "../../../lib/Axios";
import type {
  GetSectionInstitutionsResponse,
  StoreSectionInstitutionsPayload,
  UpdateSectionInstitutionsPayload,
  ApiMessageResponse,
} from "./SectionInstitutions.types";

export const getSectionInstitutions = async (
  sectionId: string,
  signal?: AbortSignal
): Promise<GetSectionInstitutionsResponse> => {
  const response = await api.get<GetSectionInstitutionsResponse>(
    `/assignment-for-census/${sectionId}`,
    { signal }
  );
  return response.data;
};

export const storeSectionInstitutions = async (
  payload: StoreSectionInstitutionsPayload
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/assignment-for-census`,
    payload
  );
  return response.data;
};

export const updateSectionInstitutions = async (
  sectionId: string,
  payload: UpdateSectionInstitutionsPayload
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/assignment-for-census/${sectionId}`,
    payload
  );
  return response.data;
};