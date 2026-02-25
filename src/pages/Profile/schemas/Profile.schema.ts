import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().max(50).optional(),
  lastname: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  mobile: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;