// src/utils/validation.ts (Corregido de nuevo)

// Definimos los tipos de datos que esperamos del formulario
interface UnitFormData { // Para Units
  name: string;
}

interface InstitutionFormData { // Para Institutions
  name: string;
  municipality: string;
  geocode: string;
  typeinst: string;
}

interface SectionData {
  name: string;
  instructions?: string | null;
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

/**
 * Valida los datos del formulario de la Institución.
 * Devuelve un ARRAY de strings con los mensajes de error.
 * Si no hay errores, devuelve un array vacío.
 */
export function validateInstitution(data: InstitutionFormData): string[] {
  const errors: string[] = [];
  const { name, municipality, geocode, typeinst } = data;
  // Regex más estricta para campos que solo deben contener letras y espacios.
  const lettersAndSpacesRegex = /^[\p{L}\s]+$/u;
  const validCharacterRegex = /^[\p{L}\p{M}\p{N}\s'.,-]+$/u;

  // Validación para 'name'
  if (!name.trim()) {
    errors.push("El nombre de la institución es obligatorio.");
  } else if (name.trim().length < 5) {
    errors.push("El nombre debe tener al menos 5 caracteres.");
  } else if (!validCharacterRegex.test(name)) {
    errors.push("El nombre no puede contener emojis ni símbolos especiales no permitidos.");
  } else if (name.trim().length > 100) {
    errors.push("El nombre no puede exceder los 100 caracteres.");
  }

  // Validación para 'municipality'
  if (!municipality.trim()) {
    errors.push("La municipalidad es obligatoria.");
  } else if (!lettersAndSpacesRegex.test(municipality)) {
    // Usamos la regex estricta para municipalidad.
    errors.push("La municipalidad solo debe contener letras y espacios.");
  } else if (municipality.trim().length > 50) {
    errors.push("La municipalidad no puede exceder los 50 caracteres.");
  }

  // Validación para 'geocode'
  if (!geocode.trim()) {
    errors.push("El geocódigo es obligatorio.");
  } else if (!/^\d+$/.test(geocode.trim())) {
    errors.push("El geocódigo solo debe contener números.");
  }

  // Validación para 'typeinst'
  if (!typeinst.trim()) {
    errors.push("El tipo de institución es obligatorio.");
  } else if (!lettersAndSpacesRegex.test(typeinst)) {
    // Usamos la regex estricta también para el tipo.
    errors.push("El tipo de institución solo debe contener letras y espacios.");
  } else if (typeinst.trim().length > 50) {
    errors.push("El tipo de institución no puede exceder los 50 caracteres.");
  }

  return errors;
}
export const validateSection = (data: SectionData): string[] => {
  const errors: string[] = [];

  // --- 1. Validación de Nombre ---
  if (!data.name.trim()) {
    errors.push("El nombre es obligatorio.");
  } else {
    if (data.name.length < 10) {
      errors.push("El nombre debe tener al menos 10 caracteres.");
    }
    if (data.name.length > 150) {
      errors.push("El nombre no puede exceder los 150 caracteres.");
    }
    // Regex de nombre (letras, números, espacios, diagonales y comas)
    const nameRegex = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9\s/,]+$/;
    if (!nameRegex.test(data.name)) {
      errors.push("El nombre contiene caracteres no permitidos (solo letras, números, espacios, / y ,).");
    }
  }

  // --- 2. Validación de Instrucciones ---
  // Solo validamos si hay algo escrito (porque es nullable)
  if (data.instructions && data.instructions.trim().length > 0) {
    const text = data.instructions;

    if (text.length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres.");
    }
    if (text.length > 2200) {
      errors.push("La descripción no puede exceder los 2200 caracteres.");
    }

    // Regex de instrucciones (letras, números, puntuación básica)
    // Nota: \pL no funciona igual en todos los navegadores antiguos, 
    // esta regex cubre español y los símbolos que pediste: . : ; - / " “ ” _ ( ) º °
    const instructionsRegex = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9\s,.:;\-/"“”_()º°]+$/;
    
    if (!instructionsRegex.test(text)) {
      errors.push("La descripción contiene caracteres inválidos.");
    }
  }

  return errors;
};
