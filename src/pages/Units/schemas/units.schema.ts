import { z } from 'zod';

export const unitSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(1, "El nombre debe tener al menos 1 caracteres.")
    .max(45, "El nombre no puede exceder los 45 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]+$/u, "El campo nombre no puede contener emojis ni símbolos especiales.")
});

export type UnitFormData = z.infer<typeof unitSchema>;