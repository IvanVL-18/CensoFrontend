import { z } from 'zod';

export const Catalogschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(125, "El nombre no puede exceder los 125 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]+$/u, "El campo nombre no puede contener emojis ni símbolos especiales.")
    .refine((val) => !/\d/.test(val), {
      message: "El nombre no puede contener números"
    })
});

export type CatalogFormData = z.infer<typeof Catalogschema>;