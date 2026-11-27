import api from "../../lib/Axios";
import type {
  CensusInstitutionsResponse,
  InstitutionUsersResponse,
  UserAnswersResponse,
  GetAnswersResponse,
} from "./AdminAnswers.types";

const enc = (id: string) => encodeURIComponent(id);

export const getCensusInstitutions = async (
  censusId: string,
): Promise<CensusInstitutionsResponse> => {
  const { data } = await api.get(
    `/admin/censuses/${enc(censusId)}/institutions`,
  );
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

export const getAnswersForReport = async (
  censusId: string,
  institutionId: string,
  userId: string,
): Promise<GetAnswersResponse> => {
  const { data } = await api.post(`/admin/censuses/get-answers`, {
    census_id: censusId,
    institution_id: institutionId,
    user_id: userId,
  });
  return data;
};
