import { z } from 'zod';

export const Indexschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(45, "El nombre no puede exceder los 45 caracteres.")
    .regex(/^[\d.]+$/, "El nombre solo puede contener números y puntos.")
});

export type IndexFormData = z.infer<typeof Indexschema>;