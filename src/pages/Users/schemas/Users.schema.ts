import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email("El correo electrónico no es válido."),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  role_id: z.union([z.string(), z.number()]).optional(),
  occupation_id: z.union([z.string(), z.number()]).optional(),
  area_id: z.union([z.string(), z.number()]).optional(),
  institution_id: z.union([z.string(), z.number()]).optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmation"],
});

export type UserFormData = z.infer<typeof UserSchema>;