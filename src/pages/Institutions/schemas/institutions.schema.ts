import { z } from "zod";

export const InstitutionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(90, "El nombre no puede exceder los 65 caracteres.")
    .regex(
      /^[\p{L}\p{M}\s]+$/u,
      "El campo nombre no puede contener números, emojis ni símbolos especiales.",
    ),

  geocode: z
    .string()
    .trim()
    .min(1, "El código postal / geocódigo es obligatorio.")
    .min(5, "El código postal / geocódigo debe tener al menos 5 caracteres.")
    .regex(/^\d+$/, "El geocódigo solo debe contener números."),
  municipality: z
    .string()
    .trim()
    .min(1, "La municipalidad es obligatoria.")
    .min(5, "La municipalidad debe tener al menos 5 caracteres.")
    .regex(
      /^[\p{L}\p{M}\s]+$/u,
      "El campo municipalidad no puede contener números, emojis ni símbolos especiales.",
    ),
  typeinst: z
    .string()
    .trim()
    .min(1, "El tipo de institución es obligatorio.")
    .min(5, "El tipo de institución debe tener al menos 5 caracteres.")
    .regex(
      /^[\p{L}\p{M}\s]+$/u,
      "El campo tipo no puede contener números, emojis ni símbolos especiales.",
    ),
});

export type InstitutionFormData = z.infer<typeof InstitutionSchema>;
