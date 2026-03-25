import api from '../lib/Axios'; // Asegúrate de que la ruta sea correcta

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  name?: string;
  token_type: string;
  complete: boolean;
}



export interface MeResponse {
  id: number;
  name: string;
  email: string;    // 👈 Agregado
  complete: boolean;
  profile: {        // 👈 Agregado
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
  // Axios ya usa el baseURL, así que solo ponemos el endpoint
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
 * Usamos un try/catch específico aquí para manejar el 401 
 * silenciosamente durante la carga inicial.
 */
export async function meRequest(): Promise<MeResponse | null> {
  try {
    const { data } = await api.get<MeResponse>('/me');
    return data;
  } catch (error: any) {
    // Si es 401, simplemente devolvemos null (usuario no logueado)
    if (error.status === 401) return null;
    throw error;
  }
}