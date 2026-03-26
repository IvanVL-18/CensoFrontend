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
  const attempts: Array<{ method: "post" | "patch" | "put"; url: string }> = [
    { method: "post", url: "/profile/complete" },
    { method: "patch", url: "/profile/complete" },
    { method: "patch", url: "/profile" },
    { method: "put", url: "/profile" },
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      const response = await api.request<{ message: string }>({
        method: attempt.method,
        url: attempt.url,
        data,
      });
      return response.data;
    } catch (error: any) {
      lastError = error;
      if (error?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
};
