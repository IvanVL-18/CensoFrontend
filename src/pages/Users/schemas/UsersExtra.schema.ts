import { z } from "zod";

const onlyLettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

const optionalNameField = (label: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length <= 50, `${label} máximo 50 caracteres`)
    .refine(
      (v) => !v || onlyLettersRegex.test(v.trim()),
      `El ${label.toLowerCase()} solo debe contener letras`
    );

export const UsersExtraSchema = z.object({
  name: optionalNameField("Nombre"),
  lastname: optionalNameField("Apellido"),

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

  address: z.string().max(200, "Dirección máximo 200 caracteres").optional(),
});