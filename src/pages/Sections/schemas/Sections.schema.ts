import { z } from 'zod';

export const Sectionschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(10, "El nombre debe tener al menos 10 caracteres.")
    .max(180, "El nombre no puede exceder los 180 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]*$/u, "El nombre no puede tener emojis ni otros símbolos."),
  instructions: z.string()
    .max(4200, "La instrucción no puede exceder los 4200 caracteres.")
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]*$/u, "La instrucción no puede tener emojis ni otros símbolos.")
    .refine((val) => val.length === 0 || val.length >= 10, {
      message: "La instrucción debe tener al menos 10 caracteres.",
    })
    .nullable()
    .optional(),
});

export type SectionFormData = z.infer<typeof Sectionschema>;