import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().optional(),
  lastname: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("El correo electrónico no es válido."),
  password: z.string().optional(), 
  password_confirmation: z.string().optional(),
  role_id: z.union([z.string(), z.number()]).optional(),
  occupation_id: z.union([z.string(), z.number()]).optional(),
  dependency_id: z.union([z.string(), z.number()]).optional(),
  institution_id: z.union([z.string(), z.number()]).optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmation"],
});

export type UserFormData = z.infer<typeof UserSchema>;