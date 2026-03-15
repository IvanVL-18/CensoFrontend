import { z } from 'zod';

const nameDescriptionRegex = /^[\p{L}\p{M}\p{N}\s'\-.,\/()]+$/u;

const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const createCensoSchema = (isEdit: boolean) => {
  let initDateValidation = z.string()
    .min(1, "La fecha de inicio es obligatoria.")
    .date({ message: "La fecha de inicio debe ser una fecha válida." });

  let deadlineValidation = z.string()
    .min(1, "La fecha límite es obligatoria.")
    .date({ message: "La fecha límite debe ser una fecha válida." });

  if (!isEdit) {
    initDateValidation = initDateValidation.refine(
      (dateStr) => {
        const date = parseDate(dateStr);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "La fecha de inicio no puede ser anterior a hoy.",
      }
    );

    deadlineValidation = deadlineValidation.refine(
      (dateStr) => {
        const date = parseDate(dateStr);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "La fecha límite no puede ser anterior a hoy.",
      }
    );
  }

  return z.object({
    name: z.string()
      .trim()
      .min(5, "El nombre debe tener al menos 5 caracteres.")
      .max(65, "El nombre no puede exceder los 65 caracteres.")
      .regex(
        nameDescriptionRegex,
        "El nombre no puede contener emojis ni símbolos especiales."
      ),

    description: z.string()
      .trim()
      .refine(val => val === "" || val.length >= 10, {
        message: "La descripción debe tener al menos 10 caracteres si se proporciona."
      })
      .refine(val => val === "" || nameDescriptionRegex.test(val), {
        message: "La descripción no puede contener emojis ni símbolos especiales."
      })
      .max(200, "La descripción no puede exceder los 200 caracteres.")
      .optional(),

    init_date: initDateValidation,

    deadline: deadlineValidation,
  }).superRefine((data, ctx) => {
    const init = parseDate(data.init_date);
    const deadline = parseDate(data.deadline);
    if (isNaN(init.getTime()) || isNaN(deadline.getTime())) {
      return;
    }
    if (deadline <= init) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha límite debe ser posterior a la fecha de inicio.",
        path: ["deadline"],
      });
    }
  });
};

export type CensoFormData = z.infer<ReturnType<typeof createCensoSchema>>;