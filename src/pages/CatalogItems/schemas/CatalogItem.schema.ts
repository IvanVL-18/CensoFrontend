import { z } from "zod";

export const CatalogItemSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, "El valor es obligatorio.")
    .max(10, "El valor no puede exceder los 10 caracteres."),
  label: z
    .string()
    .trim()
    .min(3, "La etiqueta debe tener al menos 3 caracteres.")
    .max(165, "La etiqueta no puede exceder los 165 caracteres."),
  catalog_id: z.string().trim().min(1, "Debe seleccionar un catalogo."),
});

export type CatalogItemFormData = z.infer<typeof CatalogItemSchema>;
