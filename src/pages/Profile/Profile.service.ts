import api from '../../lib/Axios';
import type { ProfileData } from './Profile.types';

export interface CompleteProfileResponse {
  message: string;
  complete: boolean;
}

export interface FullProfile {
  id: string;
  name: string | null;
  lastname: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  email: string;
  verified_at: boolean;
  role:        { id: string; name: string } | null;
  occupation:  { id: string; name: string } | null;
  dependency:  { id: string; name: string } | null;
  institution: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

export async function completeProfile(data: ProfileData): Promise<CompleteProfileResponse> {
  const { data: response } = await api.post<CompleteProfileResponse>('/profile/complete', data);
  return response;
}

export async function getProfile(): Promise<FullProfile> {
  const { data } = await api.get<{ data: FullProfile } | FullProfile>('/profile');
  return (data as any).data ?? data;
}

export interface UpdateProfileData {
  name?: string | null;
  lastname?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
}

export async function updateProfile(profileData: UpdateProfileData): Promise<{ message: string }> {
  const { data: response } = await api.patch<{ message: string }>('/profile', profileData);
  return response;
}
