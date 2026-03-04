import { z } from 'zod';

export const Roleschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(25, "El nombre no puede exceder los 25 caracteres.") 
    .regex(
  /^[\p{L}\p{M}\s',-]+$/u,
  "El nombre solo puede contener letras, espacios, apóstrofes, comas y guiones."
)
});

export type RolFormData = z.infer<typeof Roleschema>;