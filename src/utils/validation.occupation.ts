// src/utils/validation.occupation.ts

/**
 * Valida los datos para crear o actualizar una Ocupación (Occupation).
 * @param data - Objeto con el nombre de la ocupación y el ID de la institución.
 * @returns Un array de strings con los mensajes de error. Array vacío si es válido.
 */
export function validateOccupation(data: { name: string, institution_id?: string | null }): string[] {
  const errors: string[] = [];
  const name = data.name.trim();

  // Regla 1: 'name.required'
  if (name === "") {
    errors.push("El nombre de la ocupación es obligatorio.");
  } 
  // Regla 2: 'name.min'
  else if (name.length < 5) {
    errors.push("El nombre debe tener al menos 5 caracteres.");
  }

  // Regla extra: 'name.regex' (copiada de la validación de Unit)
  // Valida que no se incluyan emojis o símbolos no permitidos.
  const regex = /^[\p{L}\p{M}\p{N}\s'.,-]+$/u;
  if (!regex.test(data.name)) { // Usamos data.name (sin trim) para evaluar el input original
    errors.push("El campo nombre no puede contener emojis ni símbolos especiales.");
  }

  // Regla 3: 'institution_id.required'
  if (!data.institution_id) {
    errors.push("Debe seleccionar una institución.");
  }

  return errors;
}