interface UnitFormData { // Para Units
  name: string;
}
export function validateRol(data: UnitFormData): string[] {
  const errors: string[] = [];
  const name = data.name.trim(); // Usamos trim para las validaciones

  // Regla 1: 'name.required' (Transcripción)
  if (name === "") {
    errors.push("El nombre es obligatorio.");
    return errors; 
  }

  // Regla 2: 'name.min' (Transcripción)
  if (name.length <= 5) {
    errors.push("El nombre debe tener al menos 5 caracteres.");
  }

  // Regla 3: 'name.max' (Transcripción)
  if (name.length >= 25) {
    errors.push("El nombre no puede exceder los 25 caracteres.");
  }

  // Regla 4: 'name.regex' (Transcripción)
  
  
  const regex = /^[\p{L}\p{M}\p{N}\s'.,-]+$/u;
  
  if (!regex.test(data.name)) { // Aquí usamos data.name (sin trim)
    errors.push("El campo nombre no puede contener emojis ni símbolos especiales.");
  }

  // Regla 5: 'name.unique' -> Esta NO se puede transcribir.
  // Se validará en el servidor al momento de guardar.

  return errors;
}