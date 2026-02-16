import { z } from 'zod';

export const InstitutionSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(65, "El nombre no puede exceder los 65 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]+$/u, "El campo nombre no puede contener emojis ni símbolos especiales."),
  
    geocode: z.string()
    .trim()
    .min(1, "El código postal / geocódigo es obligatorio.")
    .regex(/^\d+$/, "El geocódigo solo debe contener números."),
    municipality: z.string()
      .trim()
      .min(1, "La municipalidad es obligatoria."),
    typeinst: z.string()
      .trim()
      .min(1, "El tipo de institución es obligatorio.")

});

export type InstitutionFormData = z.infer<typeof InstitutionSchema>;

/* interface InstitutionData {
  name: string;
  municipality: string;
  geocode: string;
  typeinst: string;
}

export const validateInstitution = (data: InstitutionData): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("El nombre de la institución es obligatorio.");
  }

  if (!data.municipality.trim()) {
    errors.push("La municipalidad es obligatoria.");
  }

  if (!data.geocode.trim()) {
    errors.push("El código postal / geocódigo es obligatorio.");
  } else if (!/^\d+$/.test(data.geocode)) {
    errors.push("El geocódigo solo debe contener números.");
  }

  if (!data.typeinst.trim()) {
    errors.push("El tipo de institución es obligatorio.");
  }

  return errors;
}; */