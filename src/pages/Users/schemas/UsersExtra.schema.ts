import { z } from "zod";

export const UsersExtraSchema = z.object({
  name: z.string().max(50, "El nombre no puede superar los 50 caracteres").optional(),
  lastname: z.string().max(50, "El apellido no puede superar los 50 caracteres").optional(),
  phone: z
    .string()
    .max(20, "Teléfono máximo 20 caracteres")
    .optional()
    .refine((v) => !v || /^[0-9+\-\s()]+$/.test(v), "Teléfono inválido"),
  mobile: z
    .string()
    .max(20, "Celular máximo 20 caracteres")
    .optional()
    .refine((v) => !v || /^[0-9+\-\s()]+$/.test(v), "Celular inválido"),
  address: z.string().max(200, "La dirección no puede superar los 200 caracteres").optional(),
});

export type UsersExtraFormData = z.infer<typeof UsersExtraSchema>;