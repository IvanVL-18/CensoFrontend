import { z } from "zod";

export const Sectionschema = z.object({
  name: z
    .string()
    .min(10, "El nombre debe tener al menos 10 caracteres.")
    .max(180, "El nombre no puede exceder los 180 caracteres.")
    .regex(
      /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9\s/,. ]+$/u,
      "El nombre no puede tener emojis ni otros símbolos.",
    ),

  instructions: z
    .string()
    .max(4200, "La instrucción no puede exceder los 4200 caracteres.")
    .regex(
      /^[\p{L}\p{M}\s\d,.:;/"“”_()º°\r\n-]+$/u,
      "La instrucción no puede tener emojis ni otros símbolos.",
    )
    .refine((val) => !val || val.length >= 10, {
      message: "La instrucción debe tener al menos 10 caracteres.",
    })
    .optional()
    .nullable(),

  indicator_id: z
    .string()
    .min(1, "Debe seleccionar un indicador.")
    .optional()
    .nullable(),

  needs_attention: z.boolean().optional(),
});

export type SectionFormData = z.infer<typeof Sectionschema>;
