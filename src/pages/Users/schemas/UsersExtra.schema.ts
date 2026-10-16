import { z } from "zod";

// Todos los campos son opcionales (el backend valida con "sometimes"):
// si vienen vacíos no se validan ni se envían; si traen texto, se validan.
const NAME_REGEX = /^[\p{L}\p{M}\s'-]+$/u;
const PHONE_REGEX = /^[0-9+\-\s()]+$/;

export const UsersExtraSchema = z.object({
  name: z.string()
    .trim()
    .max(50, "El nombre no puede exceder los 50 caracteres.")
    .refine(
      (v) => v === "" || NAME_REGEX.test(v),
      "El nombre solo puede contener letras, espacios, apóstrofes y guiones."
    ),
  lastname: z.string()
    .trim()
    .max(50, "El apellido no puede exceder los 50 caracteres.")
    .refine(
      (v) => v === "" || NAME_REGEX.test(v),
      "El apellido solo puede contener letras, espacios, apóstrofes y guiones."
    ),
  phone: z.string()
    .trim()
    .max(15, "El teléfono no puede exceder los 15 caracteres.")
    .refine(
      (v) => v === "" || PHONE_REGEX.test(v),
      "El teléfono solo puede contener números, espacios, paréntesis, + y guiones."
    ),
  mobile: z.string()
    .trim()
    .max(15, "El celular no puede exceder los 15 caracteres.")
    .refine(
      (v) => v === "" || PHONE_REGEX.test(v),
      "El celular solo puede contener números, espacios, paréntesis, + y guiones."
    ),
  address: z.string()
    .trim()
    .max(200, "La dirección no puede exceder los 200 caracteres."),
});

export type UsersExtraFormData = z.infer<typeof UsersExtraSchema>;
