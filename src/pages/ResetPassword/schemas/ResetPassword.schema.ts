import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener una mayúscula")
    .regex(/[a-z]/, "Debe contener una minúscula")
    .regex(/\d/, "Debe contener un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener un símbolo"),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
