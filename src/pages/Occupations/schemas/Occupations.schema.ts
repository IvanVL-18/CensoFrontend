import { z } from 'zod';

export const Occupationschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .regex(/^[\p{L}\p{M}\s]+$/u, "El campo nombre no puede contener números, emojis ni símbolos especiales.")
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(45, "El nombre no puede exceder los 45 caracteres.")
});

export type OccupationFormData = z.infer<typeof Occupationschema>;