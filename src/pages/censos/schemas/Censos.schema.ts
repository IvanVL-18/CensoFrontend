import { z } from 'zod';

const nameDescriptionRegex = /^[\p{L}\p{M}\p{N}\s'\-.,\/()]+$/u;

const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const Censoschema = z.object({
  name: z.string()
    .trim()
    .min(5, "El nombre debe tener al menos 5 caracteres.")
    .max(65, "El nombre no puede exceder los 125 caracteres.")
    .regex(
      nameDescriptionRegex,
      "El nombre no puede contener emojis ni símbolos especiales."
    ),

  description: z.string()
    .trim()
    .refine(val => val === "" || val.length >= 10, {
      message: "La descripción debe tener al menos 10 caracteres si se proporciona."
    })
    .max(255, "La descripción no puede exceder los 255 caracteres.")
    .optional(), 

  init_date: z.string()
    .min(1, "La fecha de inicio es obligatoria.")
    .date({ message: "La fecha de inicio debe ser una fecha válida." })
    .refine(
      (dateStr) => {
        const date = parseDate(dateStr);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "La fecha de inicio no puede ser anterior a hoy.",
      }
    ),

  deadline: z.string()
    .min(1, "La fecha límite es obligatoria.")
    .date({ message: "La fecha límite debe ser una fecha válida." }),
}).refine(
  (data) => {
    const init = parseDate(data.init_date);
    const deadline = parseDate(data.deadline);
    return deadline > init;
  },
  {
    message: "La fecha límite debe ser posterior a la fecha de inicio.",
    path: ["deadline"],
  }
);

export type CensoFormData = z.infer<typeof Censoschema>;