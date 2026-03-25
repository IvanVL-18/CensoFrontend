import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*()_+=\[\]{};:<>|./?,\-])[A-Za-z\d@#$%^&*()_+=\[\]{};:<>|./?,\-]{8,30}$/;

export const CreateUserSchema = z
  .object({
    email: z
      .string()
      .min(10, "El correo debe tener al menos 10 caracteres.")
      .max(55, "El correo no debe exceder 55 caracteres.")
      .email("El correo electrónico no es válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(30, "La contraseña no debe exceder 30 caracteres.")
      .regex(
        passwordRegex,
        "La contraseña debe contener mayúscula, minúscula, número y carácter especial."
      ),
    password_confirmation: z.string(),
    role_id: z.union([z.string(), z.number()]).optional(),
    occupation_id: z.union([z.string(), z.number()]).optional(),
    dependency_id: z.union([z.string(), z.number()]).optional(),
    institution_id: z.union([z.string(), z.number()]).optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export const UpdateUserSchema = z
  .object({
    email: z
      .string()
      .min(10, "El correo debe tener al menos 10 caracteres.")
      .max(55, "El correo no debe exceder 55 caracteres.")
      .email("El correo electrónico no es válido.")
      .optional(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(30, "La contraseña no debe exceder 30 caracteres.")
      .regex(
        passwordRegex,
        "La contraseña debe contener mayúscula, minúscula, número y carácter especial."
      )
      .optional(),
    password_confirmation: z.string().optional(),
    role_id: z.union([z.string(), z.number()]).optional(),
    occupation_id: z.union([z.string(), z.number()]).optional(),
    dependency_id: z.union([z.string(), z.number()]).optional(),
    institution_id: z.union([z.string(), z.number()]).optional(),
  })
  .refine(
    (data) =>
      !data.password ||
      (data.password_confirmation !== undefined &&
        data.password === data.password_confirmation),
    {
      message: "Las contraseñas no coinciden",
      path: ["password_confirmation"],
    }
  );

export const UserSchema = CreateUserSchema;

export type CreateUserFormData = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormData = z.infer<typeof UpdateUserSchema>;
export type UserFormData = z.infer<typeof UserSchema>;