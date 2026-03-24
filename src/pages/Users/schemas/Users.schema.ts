import { z } from 'zod';

export const UserSchema = z
  .object({
    email: z
      .string()
      .email('El correo electrónico no es válido.')
      .min(10, 'El correo electrónico debe tener al menos 10 caracteres.')
      .max(55, 'El correo electrónico no debe exceder los 55 caracteres.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(30, 'La contraseña no debe exceder los 30 caracteres.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*()_+=\[\]{};:<>|.\/?,\-])[A-Za-z\d@#$%^&*()_+=\[\]{};:<>|.\/?,\-]{8,30}$/,
        'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.'
      )
      .optional(),
    password_confirmation: z.string().optional(),
    role_id: z.union([z.string(), z.number()]).optional(),
    occupation_id: z.union([z.string(), z.number()]).optional(),
    dependency_id: z.union([z.string(), z.number()]).optional(),
    institution_id: z.union([z.string(), z.number()]).optional(),
  })
  .refine((data) => {
    if (data.password) {
      return data.password === data.password_confirmation;
    }
    return true;
  }, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

export type UserFormData = z.infer<typeof UserSchema>;