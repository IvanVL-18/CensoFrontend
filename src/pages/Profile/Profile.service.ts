import api from '../../lib/Axios';
import type { ProfileData } from './Profile.types';

export interface CompleteProfileResponse {
  message: string;
  complete: boolean;
}

export async function completeProfile(data: ProfileData): Promise<CompleteProfileResponse> {
  const { data: response } = await api.post<CompleteProfileResponse>('/profile/complete', data);
  return response;
}
