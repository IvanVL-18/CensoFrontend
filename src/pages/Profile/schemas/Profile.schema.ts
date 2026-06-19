import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().max(50).optional().nullable(),
  lastname: z.string().max(50).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  mobile: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const passwordChangeSchema = z
  .object({
    password: z
      .string()
      .min(8,  "Mínimo 8 caracteres")
      .max(30, "Máximo 30 caracteres")
      .regex(/[A-Z]/,        "Al menos una mayúscula")
      .regex(/[a-z]/,        "Al menos una minúscula")
      .regex(/[0-9]/,        "Al menos un número")
      .regex(/[^a-zA-Z0-9]/, "Al menos un símbolo especial"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;