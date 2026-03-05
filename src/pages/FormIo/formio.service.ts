// src/pages/FormIo/formio.service.ts
import api from "../../lib/Axios";
import type { ApiPaginationResponse } from './formio.types';

// 👇 SOLUCIÓN: Usar variables de entorno. 
// Si usas Vite: import.meta.env.VITE_API_URL
// Si usas Create React App: process.env.REACT_APP_API_URL
// Fallback a localhost si no está definida.


export const getQuestionsRender = async (
  id: string | number,
  signal?: AbortSignal,
): Promise<{ question_structure: any }> => {
  const response = await api.get(`/questions/get-component/${id}`, {
    signal,
  });
  return response.data;
};