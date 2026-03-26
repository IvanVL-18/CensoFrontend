import api from "../lib/Axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  name?: string;
  email?: string;
  token_type: string;
  complete: boolean;
}

export interface MeResponse {
  id: number;
  name: string;
  email: string;
  complete: boolean;
  profile?: {
    name?: string;
    lastname?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    profile_completed_at?: string | null;
  };
}

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/login", credentials);
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/logout");
}

export async function meRequest(): Promise<MeResponse | null> {
  try {
    const { data } = await api.get<MeResponse>("/me");
    return data;
  } catch (error: any) {
    if (error?.status === 401) return null;
    throw error;
  }
}
