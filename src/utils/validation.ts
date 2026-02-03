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
