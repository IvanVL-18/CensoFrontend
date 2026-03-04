import { z } from 'zod';

export const Permissionschema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(25, "El nombre no puede exceder los 25 caracteres.") 
    .regex(/^[\p{L}\p{M}\p{N}\s'.,-]+$/u, "El campo nombre no puede contener emojis ni símbolos especiales.")
});

export type PermissionFormData = z.infer<typeof Permissionschema>;