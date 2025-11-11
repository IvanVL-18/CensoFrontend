// src/utils/validation.ts

/**
 * Valida los datos para crear o actualizar un Módulo (Unit).
 * @param data - Objeto con el nombre del módulo.
 * @returns Un array de strings con los mensajes de error. Array vacío si es válido.
 */
export function validateUnit(data: { name: string }): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("El nombre del módulo es obligatorio.");
  }

  return errors;
}

/**
 * Valida los datos para crear o actualizar una Ocupación (Occupation).
 * @param data - Objeto con el nombre de la ocupación y el ID de la institución.
 * @returns Un array de strings con los mensajes de error. Array vacío si es válido.
 */
export function validateOccupation(data: { name: string, institution_id?: string | null }): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("El nombre de la ocupación es obligatorio.");
  } else if (data.name.trim().length < 5) {
    errors.push("El nombre debe tener al menos 5 caracteres.");
  }

  if (!data.institution_id) {
    errors.push("Debe seleccionar una institución.");
  }

  return errors;
}