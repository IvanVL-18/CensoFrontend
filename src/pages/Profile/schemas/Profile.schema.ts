import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().max(50).optional().nullable(),
  lastname: z.string().max(50).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  mobile: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;