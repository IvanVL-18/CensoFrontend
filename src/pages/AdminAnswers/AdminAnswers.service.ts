import api from "../../lib/Axios";
import type {
  CensusInstitutionsResponse,
  InstitutionUsersResponse,
  UserAnswersResponse,
} from "./AdminAnswers.types";

const enc = (id: string) => encodeURIComponent(id);

export const getCensusInstitutions = async (
  censusId: string,
): Promise<CensusInstitutionsResponse> => {
  const { data } = await api.get(`/admin/censuses/${enc(censusId)}/institutions`);
  return data;
};

export const getInstitutionUsers = async (
  censusId: string,
  institutionId: string,
): Promise<InstitutionUsersResponse> => {
  const { data } = await api.get(
    `/admin/censuses/${enc(censusId)}/institutions/${enc(institutionId)}/users`,
  );
  return data;
};

export const getUserAnswers = async (
  censusId: string,
  institutionId: string,
  userId: string,
): Promise<UserAnswersResponse> => {
  const { data } = await api.get(
    `/admin/censuses/${enc(censusId)}/institutions/${enc(institutionId)}/users/${enc(userId)}/answers`,
  );
  return data;
};
