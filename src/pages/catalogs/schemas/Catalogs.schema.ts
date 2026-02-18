import { z } from 'zod';

export const Catalogschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(125, "El nombre no puede exceder los 125 caracteres.")
    .regex(
      /^[\p{L}\p{M}\s'.,-]+$/u,
      "El nombre solo puede contener letras, espacios, apóstrofes, puntos, comas y guiones."
    ),
  slug: z.string()
  .trim()
  .min(1, "El slug es obligatorio.")
  .min(3, "El slug debe tener al menos 3 caracteres.")
  .max(50, "El slug no puede exceder los 50 caracteres.")
  .regex(
    /^[a-z-]+$/,                
    "El slug solo puede contener letras minúsculas y guiones."
  )
});

export type CatalogFormData = z.infer<typeof Catalogschema>;