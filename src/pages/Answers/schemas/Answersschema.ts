import { z } from 'zod';

export const questionschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(913, "El nombre no puede exceder los 913 caracteres."), // Ajustado a tu migración
  
  instructions: z.string()
    .trim()
    .max(7500, "Las instrucciones no pueden exceder los 7500 caracteres.")
    .optional()
    .or(z.literal('')), // Permite string vacío

  commentaries: z.boolean().default(false).optional(),
});

export type questionFormData = z.infer<typeof questionschema>;