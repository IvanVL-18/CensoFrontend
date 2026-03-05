import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
// Crear una instancia de Axios con la URL base desde las variables de entorno
const apiClient = axios.create({
  baseURL: baseURL, // Utiliza la variable de entorno
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('Axios baseURL:', baseURL); // Verificar que la URL base se establece correctamente

export default apiClient;
