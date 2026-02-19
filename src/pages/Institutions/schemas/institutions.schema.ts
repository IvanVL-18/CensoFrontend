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

