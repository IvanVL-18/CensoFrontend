import api from "../../lib/Axios";
import type { ProfileSchema } from "./schemas/Profile.schema";
import type { ProfileData } from "./Profile.types";

export const getProfile = async (signal?: AbortSignal): Promise<ProfileData> => {
  const response = await api.get<{ data: ProfileData }>("/profile", { signal });
  return (response.data as any).data ?? response.data;
};

export const completeProfile = async (
  data: ProfileSchema,
): Promise<{ message: string }> => {
  const response = await api.post("/profile/complete", data);
  return response.data;
};