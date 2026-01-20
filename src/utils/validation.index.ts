// src/utils/validation.index.ts

// Definimos el tipo de dato que esperamos del formulario del modal
interface IndexFormData {
  name: string;
}

/**
 * Valida los datos del formulario de un Módulo (Index), replicando las reglas del backend.
 * @param data - Objeto con los datos del formulario.
 * @returns Un array de strings con los mensajes de error. Array vacío si es válido.
 */
export function validateIndex(data: IndexFormData): string[] {
  const errors: string[] = [];
  const name = data.name; // No usamos trim() para que el regex pueda evaluar espacios si el usuario los escribe.

  // Regla 1: 'name.required' (El nombre es obligatorio)
  if (name === "") {
    errors.push("El nombre del índice es obligatorio.");
    return errors; // Si está vacío, no seguimos validando
  }

  // Regla 2: 'name.min' (Mínimo 1 caracter)
  if (name.length < 1) {
    errors.push("El nombre del índice debe tener al menos 1 caracteres.");
  }

  // Regla 3: 'name.max' (Máximo 45 caracteres)
  if (name.length > 45) {
    errors.push("El nombre del índice no puede exceder los 45 caracteres.");
  }

  // Regla 4: 'name.regex' (Formato tipo 1.1.2)
  // La expresión regular se traduce directamente de la regla de Laravel.
  const regex = /^(?:[1-9]\d*)(?:\.(?:[1-9]\d*))*$/;
  if (!regex.test(data.name)) {
    errors.push("Formato inválido (ej. 1.1.2)");
  }

  // Nota: La regla 'unique' solo puede ser validada por el servidor.
  // El modal ya está preparado para recibir y mostrar este error desde la API.
  return errors;
}