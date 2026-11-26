import { z } from "zod";

export const profileSchema = z.object({
  name:     z.string().max(50, "El nombre no puede superar los 50 caracteres").regex(/^[\p{L}\p{M}\s'\-\.,]+$/u, "Solo letras, espacios y puntuación básica").optional().nullable(),
  lastname: z.string().max(50, "El apellido no puede superar los 50 caracteres").regex(/^[\p{L}\p{M}\s'\-\.,]+$/u, "Solo letras, espacios y puntuación básica").optional().nullable(),
  phone:  z.string().max(15).optional().nullable(),
  mobile: z.string().max(15).optional().nullable(),
  address:  z.string().max(200, "La dirección no puede superar los 200 caracteres").regex(/^[\p{L}\p{M}\p{N}\s'\-\.,#]+$/u, "Caracteres no válidos en la dirección").optional().nullable(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

const NAME_REGEX    = /^[\p{L}\p{M}\s'\-.,]+$/u;
const ADDRESS_REGEX = /^[\p{L}\p{M}\p{N}\s'\-.,#]+$/u;
const PHONE_REGEX   = /^\+?[0-9]{10,15}$/;

// Mismas reglas que CompleteProfileRequest del backend: todos los campos son obligatorios.
export const completeProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres")
    .regex(NAME_REGEX, "Solo letras, espacios y puntuación básica"),
  lastname: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .min(4, "Los apellidos deben tener al menos 4 caracteres")
    .max(50, "Los apellidos no pueden superar los 50 caracteres")
    .regex(NAME_REGEX, "Solo letras, espacios y puntuación básica"),
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono fijo es obligatorio")
    .regex(PHONE_REGEX, "Debe tener entre 10 y 15 dígitos"),
  mobile: z
    .string()
    .trim()
    .min(1, "El teléfono móvil es obligatorio")
    .regex(PHONE_REGEX, "Debe tener entre 10 y 15 dígitos"),
  address: z
    .string()
    .trim()
    .min(1, "La dirección es obligatoria")
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede superar los 200 caracteres")
    .regex(ADDRESS_REGEX, "Caracteres no válidos en la dirección")
    .regex(/\p{L}/u, "La dirección debe incluir letras"),
});

export type CompleteProfileSchema = z.infer<typeof completeProfileSchema>;

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