import { z } from "zod";

// Deben coincidir EXACTO con las regex del StoreSectionRequest en Laravel
// NAME_REGEX se replica en: Store/UpdateSectionRequest y SectionsImport (carga masiva)
const NAME_REGEX = /^[\p{L}\p{M}\p{N}\s/,.:;_"()%#´-]+$/u;
const INSTRUCTIONS_REGEX =
  /^[\p{L}\p{M}\p{N}\s/,.:;–—_"“”‘’'(){}\[\]º°´&%|¿?¡!\r\n-]+$/u;

export const Sectionschema = z.object({
  name: z
    .string()
    .min(10, "El nombre debe tener al menos 10 caracteres.")
    .max(180, "El nombre no puede exceder los 180 caracteres.")
    .regex(NAME_REGEX, "El nombre no puede tener emojis ni otros símbolos."),

  instructions: z
    .string()
    .max(7600, "La instrucción no puede exceder los 7600 caracteres.")
    .refine((val) => !val || val.length >= 10, {
      message: "La instrucción debe tener al menos 10 caracteres.",
    })
    .refine(
      (val) => !val || INSTRUCTIONS_REGEX.test(val),
      "La instrucción no puede tener emojis ni otros símbolos.",
    )
    .optional()
    .nullable(),

  indicator_id: z
    .string()
    .min(1, "Debe seleccionar un indicador.")
    .optional()
    .nullable(),

  attention: z.union([z.boolean(), z.number()]).optional(),
});

export type SectionFormData = z.infer<typeof Sectionschema>;