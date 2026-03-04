import { z } from 'zod';

export const Categorieschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(65, "El nombre no puede exceder los 65 caracteres.") 
    .regex(
  /^[\p{L}\p{M}\s',-]+$/u,
  "El nombre solo puede contener letras, espacios, apóstrofes, comas y guiones."
)
});

export type CategoryFormData = z.infer<typeof Categorieschema>;