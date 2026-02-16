import { z } from "zod";
const passwordRule = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(30, "La contraseña no debe exceder 30 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*()_+=\[\]{};:<>|.\/?,\-])[A-Za-z\d@#$%^&*()_+=\[\]{};:<>|.\/?,\-]{8,30}$/,
    "La contraseña debe incluir: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial"
  );

const emailRule = z
  .string()
  .min(10, "El correo debe tener al menos 10 caracteres")
  .max(55, "El correo no debe exceder 55 caracteres")
  .email("El correo no es válido");

export const CreateUserSchema = z
  .object({
    email: emailRule,
    password: passwordRule,
    password_confirmation: z.string().min(1, "Confirma la contraseña"),
    role_id: z.string().min(1, "Selecciona un rol"), // encriptado
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "La confirmación de la contraseña no coincide.",
    path: ["password_confirmation"],
  });

export const UpdateUserSchema = z
  .object({
    email: emailRule,
    password: z.string().optional().transform((v) => (v ?? "").trim()),
    password_confirmation: z.string().optional().transform((v) => (v ?? "").trim()),
    role_id: z.string().min(1, "Selecciona un rol"),
  })
  .superRefine((data, ctx) => {
    const wantsChange = data.password.length > 0;

    if (!wantsChange) return;
    const passCheck = passwordRule.safeParse(data.password);
    if (!passCheck.success) {
      for (const issue of passCheck.error.issues) {
        ctx.addIssue({ ...issue, path: ["password"] });
      }
      return;
    }
    if (!data.password_confirmation || data.password_confirmation.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["password_confirmation"],
        message: "Confirma la contraseña",
      });
      return;
    }
    if (data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: "custom",
        path: ["password_confirmation"],
        message: "La confirmación de la contraseña no coincide.",
      });
    }
  });
