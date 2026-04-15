import api from '../lib/Axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  name?: string;
  token_type: string;
  access_token: string;
  complete: boolean;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  complete: boolean;
  role: string | null;
  permissions: string[];
  profile?: {
    name?: string;
    lastname?: string;
    phone?: string;
    mobile?: string;
    address?: string;
  };
}

/**
 * POST /login
 */
export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/login', credentials);
  return data;
}

/**
 * POST /logout
 */
export async function logoutRequest(): Promise<void> {
  await api.post('/logout');
}

/**
 * GET /me
 * Devuelve el usuario autenticado con su rol y permisos, o null si no hay sesión.
 */
export async function meRequest(): Promise<MeResponse | null> {
  try {
    const { data } = await api.get<MeResponse>('/me');
    return data;
  } catch (error: any) {
    if (error.status === 401) return null;
    throw error;
  }
}
