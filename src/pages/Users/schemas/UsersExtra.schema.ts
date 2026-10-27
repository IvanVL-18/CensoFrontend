import { z } from "zod";

// Reglas replicadas de UpdateUserRequest.php (backend).
// Todos los campos son opcionales (el backend valida con "sometimes"):
// si vienen vacíos no se validan ni se envían; si traen texto, se validan.
const NAME_REGEX = /^[\p{L}\p{M}\s'.,-]+$/u;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const HAS_LETTER_REGEX = /\p{L}/u;

export const UsersExtraSchema = z.object({
  name: z.string()
    .trim()
    .refine((v) => v === "" || v.length >= 3, "El nombre debe tener al menos 3 caracteres.")
    .refine((v) => v.length <= 50, "El nombre no puede exceder los 50 caracteres.")
    .refine(
      (v) => v === "" || NAME_REGEX.test(v),
      "El nombre solo puede contener letras, espacios, apóstrofes, guiones, puntos y comas."
    ),
  lastname: z.string()
    .trim()
    .refine((v) => v === "" || v.length >= 4, "El apellido debe tener al menos 4 caracteres.")
    .refine((v) => v.length <= 50, "El apellido no puede exceder los 50 caracteres.")
    .refine(
      (v) => v === "" || NAME_REGEX.test(v),
      "El apellido solo puede contener letras, espacios, apóstrofes, guiones, puntos y comas."
    ),
  phone: z.string()
    .trim()
    .refine(
      (v) => v === "" || PHONE_REGEX.test(v),
      "El teléfono debe tener entre 10 y 15 dígitos, opcionalmente iniciando con +."
    ),
  mobile: z.string()
    .trim()
    .refine(
      (v) => v === "" || PHONE_REGEX.test(v),
      "El celular debe tener entre 10 y 15 dígitos, opcionalmente iniciando con +."
    ),
  address: z.string()
    .trim()
    .refine((v) => v === "" || v.length >= 5, "La dirección debe tener al menos 5 caracteres.")
    .refine((v) => v.length <= 200, "La dirección no puede exceder los 200 caracteres.")
    .refine(
      (v) => v === "" || HAS_LETTER_REGEX.test(v),
      "La dirección debe contener al menos una letra."
    ),
});

export type UsersExtraFormData = z.infer<typeof UsersExtraSchema>;
