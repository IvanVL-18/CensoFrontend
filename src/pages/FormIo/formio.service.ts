// src/pages/FormIo/formio.service.ts
import axios from '../../lib/Axios'; // O tu importación directa de axios si no usas el lib configurado
import type { ApiPaginationResponse } from './formio.types';

// Asegúrate de que esta URL base coincida con tu .env o hardcodéala para pruebas
// Basado en tu JSON, la IP es 192.168.20.127:8000
const API_URL = 'http://192.168.20.127:8000/api'; 

export const getQuestionsRender = async (page: number = 1): Promise<ApiPaginationResponse> => {
    // Llamamos al endpoint que creaste en Laravel
    const response = await axios.get<ApiPaginationResponse>(`${API_URL}/questions-render?page=${page}`);
    return response.data;
};