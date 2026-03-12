import { z } from "zod";

export const Permissionschema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .min(4, "El nombre debe tener al menos 4 caracteres.")
    .max(45, "El nombre no puede exceder los 45 caracteres.")
    .regex(
      /^[\p{L}\p{M}\p{N}]+\.[\p{L}\p{M}\p{N}]+$/u,
      "El formato debe ser 'modulo.accion' (ej: usuarios.leer) sin espacios ni símbolos.",
    ),
});

export type PermissionFormData = z.infer<typeof Permissionschema>;
