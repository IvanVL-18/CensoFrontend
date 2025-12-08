// src/utils/validation.ts (Corregido de nuevo)

// ==================== INTERFACES ====================

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

interface UserFormData { // Para Users
  full_name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role_id: string;
  institution_id: string;
  occupation_id: string;
  avatar_url?: string | null;
  status?: 'active' | 'inactive' | 'pending';
}

// ==================== FUNCIONES DE UNIDAD ====================

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

// ==================== FUNCIONES DE INSTITUCIÓN ====================

/**
 * Valida los datos del formulario de la Institución.
 * Devuelve un ARRAY de strings con los mensajes de error.
 * Si no hay errores, devuelve un array vacío.
 */
export function validateInstitution(data: InstitutionFormData): string[] {
  const errors: string[] = [];
  const { name, municipality, geocode, typeinst } = data;
  
  // Usamos las funciones individuales para componer la validación completa
  return [
    ...validateInstitutionName(name),
    ...validateInstitutionMunicipality(municipality),
    ...validateInstitutionGeocode(geocode),
    ...validateInstitutionTypeinst(typeinst),
  ];
}

export function validateInstitutionName(name: string): string[] {
  const errors: string[] = [];
  const trimmedName = name?.trim() || '';
  const validCharacterRegex = /^[\p{L}\p{M}\s'.,-]+$/u;

  if (!trimmedName) {
    errors.push("El nombre de la institución es obligatorio.");
  } else if (trimmedName.length < 5) {
    errors.push("El nombre debe tener al menos 5 caracteres.");
  } else if (trimmedName.length > 100) {
    errors.push("El nombre no puede exceder los 100 caracteres.");
  } else if (!validCharacterRegex.test(trimmedName)) {
    errors.push("El nombre solo puede contener letras, espacios y los símbolos '.,- (no se permiten números).");
  }
  
  return errors;
}

export function validateInstitutionMunicipality(municipality: string): string[] {
  const errors: string[] = [];
  const trimmedMunicipality = municipality?.trim() || '';
  const lettersSpacesCommasAccentsRegex = /^[\p{L}\s,áéíóúÁÉÍÓÚüÜñÑ]+$/u;

  if (!trimmedMunicipality) {
    errors.push("La municipalidad es obligatoria.");
  } else if (trimmedMunicipality.length > 50) {
    errors.push("La municipalidad no puede exceder los 50 caracteres.");
  } else if (!lettersSpacesCommasAccentsRegex.test(trimmedMunicipality)) {
    errors.push("La municipalidad solo debe contener letras, espacios, comas (,) y acentos.");
  }
  
  return errors;
}

export function validateInstitutionGeocode(geocode: string): string[] {
  const errors: string[] = [];
  const trimmedGeocode = geocode?.trim() || '';

  if (!trimmedGeocode) {
    errors.push("El geocódigo es obligatorio.");
  } else if (!/^\d+$/.test(trimmedGeocode)) {
    errors.push("El geocódigo solo debe contener números.");
  }
  
  return errors;
}

export function validateInstitutionTypeinst(typeinst: string): string[] {
  const errors: string[] = [];
  const trimmedTypeinst = typeinst?.trim() || '';
  const lettersSpacesAccentsRegex = /^[\p{L}\sáéíóúÁÉÍÓÚüÜñÑ]+$/u;

  if (!trimmedTypeinst) {
    errors.push("El tipo de institución es obligatorio.");
  } else if (trimmedTypeinst.length > 50) {
    errors.push("El tipo de institución no puede exceder los 50 caracteres.");
  } else if (!lettersSpacesAccentsRegex.test(trimmedTypeinst)) {
    errors.push("El tipo de institución solo debe contener letras, espacios y acentos.");
  }
  
  return errors;
}

// ==================== FUNCIONES DE SECCIÓN ====================

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
    // esta regex cubre español y los símbolos que pediste: . : ; - / " " " _ ( ) º °
    const instructionsRegex = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9\s,.:;\-/"''_()º°]+$/;
    
    if (!instructionsRegex.test(text)) {
      errors.push("La descripción contiene caracteres inválidos.");
    }
  }

  return errors;
};

// ==================== FUNCIONES DE USUARIO ====================

/**
 * Valida los datos del formulario de Usuario.
 * Devuelve un ARRAY de strings con los mensajes de error.
 * Si no hay errores, devuelve un array vacío.
 */
export function validateUser(data: UserFormData, isEditing: boolean = false): string[] {
  const errors: string[] = [];
  const { 
    full_name, 
    email, 
    password, 
    confirmPassword,
    role_id, 
    institution_id, 
    occupation_id,
    status 
  } = data;
  
  // Regex para validaciones
  const nameRegex = /^[\p{L}\p{M}\s'.-]+$/u; // Nombres con apóstrofes, puntos y guiones
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email básico
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // ============ VALIDACIÓN DE NOMBRE COMPLETO ============
  const trimmedFullName = full_name?.trim() || '';
  
  if (!trimmedFullName) {
    errors.push("El nombre completo es obligatorio.");
  } else {
    if (trimmedFullName.length < 5) {
      errors.push("El nombre completo debe tener al menos 5 caracteres.");
    }
    
    if (trimmedFullName.length > 100) {
      errors.push("El nombre completo no puede exceder los 100 caracteres.");
    }
    
    if (!nameRegex.test(full_name)) {
      errors.push("El nombre completo solo puede contener letras, espacios, apóstrofes (') y guiones (-).");
    }
  }

  // ============ VALIDACIÓN DE EMAIL ============
  const trimmedEmail = email?.trim() || '';
  
  if (!trimmedEmail) {
    errors.push("El correo electrónico es obligatorio.");
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.push("Por favor, ingresa un correo electrónico válido.");
  } else if (trimmedEmail.length > 255) {
    errors.push("El correo electrónico no puede exceder los 255 caracteres.");
  }

  // ============ VALIDACIÓN DE CONTRASEÑA ============
  // Solo validar contraseña si NO estamos editando o si se proporciona una nueva
  if (!isEditing || (password && password.trim())) {
    if (!password) {
      errors.push("La contraseña es obligatoria para nuevos usuarios.");
    } else if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres.");
    } else if (password.length > 100) {
      errors.push("La contraseña no puede exceder los 100 caracteres.");
    } else if (password && !passwordRegex.test(password)) {
      errors.push("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).");
    }
    
    // Validación de confirmación de contraseña
    if (confirmPassword && password !== confirmPassword) {
      errors.push("Las contraseñas no coinciden.");
    }
  }

  // ============ VALIDACIÓN DE CAMPOS REQUERIDOS ============
  if (!role_id || role_id === '') {
    errors.push("Debes seleccionar un rol.");
  }
  
  if (!institution_id || institution_id === '') {
    errors.push("Debes seleccionar una institución.");
  }
  
  if (!occupation_id || occupation_id === '') {
    errors.push("Debes seleccionar una ocupación.");
  }
  
  // CORRECCIÓN: status es opcional en la interfaz, verificamos si está definido
  if (status === undefined) {
    errors.push("Debes seleccionar un estado.");
  }

  return errors;
}

/**
 * Valida SOLO el nombre completo del usuario (para validación en tiempo real)
 */
export function validateUserName(full_name: string): string[] {
  const errors: string[] = [];
  const trimmedFullName = full_name?.trim() || '';
  const nameRegex = /^[\p{L}\p{M}\s'.-]+$/u;

  if (!trimmedFullName) {
    errors.push("El nombre completo es obligatorio.");
  } else {
    if (trimmedFullName.length < 5) {
      errors.push("El nombre completo debe tener al menos 5 caracteres.");
    }
    
    if (trimmedFullName.length > 100) {
      errors.push("El nombre completo no puede exceder los 100 caracteres.");
    }
    
    if (!nameRegex.test(full_name)) {
      errors.push("El nombre completo solo puede contener letras, espacios, apóstrofes (') y guiones (-).");
    }
  }

  return errors;
}

/**
 * Valida SOLO el email del usuario (para validación en tiempo real)
 */
export function validateUserEmail(email: string): string[] {
  const errors: string[] = [];
  const trimmedEmail = email?.trim() || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail) {
    errors.push("El correo electrónico es obligatorio.");
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.push("Por favor, ingresa un correo electrónico válido.");
  } else if (trimmedEmail.length > 255) {
    errors.push("El correo electrónico no puede exceder los 255 caracteres.");
  }

  return errors;
}

/**
 * Valida SOLO la contraseña del usuario
 */
export function validateUserPassword(password: string, confirmPassword?: string): string[] {
  const errors: string[] = [];
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!password) {
    errors.push("La contraseña es obligatoria.");
  } else if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres.");
  } else if (password.length > 100) {
    errors.push("La contraseña no puede exceder los 100 caracteres.");
  } else if (!passwordRegex.test(password)) {
    errors.push("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).");
  }
  
  if (confirmPassword && password !== confirmPassword) {
    errors.push("Las contraseñas no coinciden.");
  }

  return errors;
}

// ==================== EXPORTACIONES ====================

export type {
  UnitFormData,
  InstitutionFormData,
  SectionData,
  UserFormData
};