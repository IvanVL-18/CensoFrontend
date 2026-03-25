import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// El token viaja en la HttpOnly cookie automáticamente en cada request
axios.defaults.withCredentials = true;

export interface LoginCredentials {
  email: string;
  password: string;
}

// access_token ya NO viene en el body — el backend lo setea como HttpOnly cookie
export interface LoginResponse {
  token_type: "Bearer";
  name?: string;
  complete: boolean; // false = perfil incompleto, redirigir a completar
}

export interface AuthError {
  message: string;
}

export async function loginRequest(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>(
      `${API_URL}/login`,
      credentials
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Lanza el mensaje que manda Laravel (ej: "Credenciales incorrectas")
      throw new Error(
        error.response?.data?.message ?? "Error al iniciar sesión"
      );
    }
    throw error;
  }
}

// Ya no recibe token — la cookie se envía sola gracias a withCredentials
export async function logoutRequest(): Promise<void> {
  try {
    await axios.post(`${API_URL}/logout`);
  } catch {
    // No importa si falla, limpiamos contexto de todas formas
  }
}