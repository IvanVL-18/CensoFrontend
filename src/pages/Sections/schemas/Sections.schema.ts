import { z } from 'zod';

export const Sectionschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(10, "El nombre debe tener al menos 10 caracteres.")
    .max(180, "El nombre no puede exceder los 180 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]+$/u, "El campo nombre no puede contener emojis ni símbolos especiales.")
});

export type SectionFormData = z.infer<typeof Sectionschema>;