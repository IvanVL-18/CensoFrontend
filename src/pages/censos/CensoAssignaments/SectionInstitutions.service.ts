import api from "../../../lib/Axios";
import type {
  GetSectionInstitutionsResponse,
  StoreSectionInstitutionsPayload,
  ApiMessageResponse,
} from "./SectionInstitutions.types";

export const getSectionInstitutions = async (
  sectionId: string,
  signal?: AbortSignal
): Promise<GetSectionInstitutionsResponse> => {
  const response = await api.get<GetSectionInstitutionsResponse>(
    `/assignment-for-censo/${sectionId}`,
    { signal }
  );
  return response.data;
};

export const storeSectionInstitutions = async (
  payload: StoreSectionInstitutionsPayload
): Promise<ApiMessageResponse> => {
  const response = await api.post<ApiMessageResponse>(
    `/assignment-for-censo`,
    payload
  );
  return response.data;
};

export const updateSectionInstitutions = async (
  sectionId: string,
  payload: Pick<StoreSectionInstitutionsPayload, 'institutions'>
): Promise<ApiMessageResponse> => {
  const response = await api.put<ApiMessageResponse>(
    `/assignment-for-censo/${sectionId}`,
    payload
  );
  return response.data;
};