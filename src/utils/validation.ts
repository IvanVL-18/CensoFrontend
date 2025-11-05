// src/utils/validation.ts (Corregido de nuevo)

// Definimos los tipos de datos que esperamos del formulario
interface UnitFormData {
  name: string;
}

/**
 * Valida los datos del formulario de la Unidad, replicando las reglas del backend.
 * Recibe un objeto con los datos y devuelve un ARRAY de strings con los mensajes de error.
 * Si no hay errores, devuelve un array vacío.
 */
export function validateUnit(data: UnitFormData): string[] {
  const errors: string[] = [];
  const name = data.name.trim(); // Usamos trim para las validaciones

  // Regla 1: 'name.required' (Transcripción)
  if (name === "") {
    errors.push("El nombre es obligatorio.");
    return errors; 
  }

  // Regla 2: 'name.min' (Transcripción)
  if (name.length < 5) {
    errors.push("El nombre debe tener al menos 5 caracteres.");
  }

  // Regla 3: 'name.max' (Transcripción)
  if (name.length > 45) {
    errors.push("El nombre no puede exceder los 45 caracteres.");
  }

  // Regla 4: 'name.regex' (Transcripción)
  
  // <--- CORRECCIÓN AQUÍ ---
  // Se quitaron los escapes innecesarios (\', \.)
  // y se movió el guion (-) al final de la clase para que no requiera escape.
  const regex = /^[\p{L}\p{M}\p{N}\s'.,-]+$/u;
  
  if (!regex.test(data.name)) { // Aquí usamos data.name (sin trim)
    errors.push("El campo nombre no puede contener emojis ni símbolos especiales.");
  }

  // Regla 5: 'name.unique' -> Esta NO se puede transcribir.
  // Se validará en el servidor al momento de guardar.

  return errors;
}