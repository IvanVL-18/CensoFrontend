import { z } from 'zod';

export const sectionSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.") 
    .min(10, "El nombre debe tener al menos 10 caracteres.")
    .max(180, "El nombre no puede exceder los 180 caracteres.")
    .regex(
      /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9\s/,.]+$/, 
      "El nombre no puede tener emojis ni otros símbolos."
    ),


  instructions: z.string()
    .trim()
    .min(10, "La instrucción debe tener al menos 10 caracteres.")
    .max(4200, "La instrucción no puede exceder los 4200 caracteres.")
    .regex(
      /^[\p{L}\p{M}\p{N}\s,.:;\-/"“”_()º°]+$/u, 
      "La instrucción no puede tener emojis ni otros símbolos."
    )
    .or(z.literal('')) 
    .or(z.null())      
    .optional(),       
});

export type SectionFormData = z.infer<typeof sectionSchema>;