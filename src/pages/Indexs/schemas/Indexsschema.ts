import { z } from 'zod';

export const Indexschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .max(45, "El nombre no puede exceder los 45 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]+$/u, "El campo nombre no puede contener emojis ni símbolos especiales.")
});

export type IndexFormData = z.infer<typeof Indexschema>;