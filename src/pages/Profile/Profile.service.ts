import api from "../../lib/Axios";
import type { ProfileData } from "./Profile.types";

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
  role: { id: string; name: string } | null;
  occupation: { id: string; name: string } | null;
  dependency: { id: string; name: string } | null;
  institution: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
  census: { id: string; name: string } | null;
}

export async function completeProfile(
  data: ProfileData,
): Promise<CompleteProfileResponse> {
  const { data: response } = await api.post<CompleteProfileResponse>(
    "/profile/complete",
    data,
  );
  return response;
}

export async function getProfile(): Promise<FullProfile> {
  const { data } = await api.get<{ data: FullProfile } | FullProfile>(
    "/profile",
  );
  return (data as any).data ?? data;
}

export interface UpdateProfileData {
  name?: string | null;
  lastname?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  password?: string;
  password_confirmation?: string;
  occupation_id?: string | number | null;
  dependency_id?: string | number | null;
  census_id?: string | number | null;
}

export interface UpdateProfileResponse {
  message: string;
  complete?: boolean;
}

export async function updateProfile(
  profileData: UpdateProfileData,
): Promise<UpdateProfileResponse> {
  const { data: response } = await api.patch<UpdateProfileResponse>(
    "/profile",
    profileData,
  );
  return response;
}

export async function getCatalogList(
  endpoint: string,
  signal?: AbortSignal,
): Promise<{ id: string | number; name: string }[]> {
  try {
    const { data } = await api.get(`/${endpoint}`, { signal });
    return (data as any).data ?? data ?? [];
  } catch {
    return [];
  }
}
