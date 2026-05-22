import api from "../../lib/Axios";

export async function verifyTokenRequest(token: string): Promise<void> {
  await api.get(`/password/${token}/verify-token`);
}

export async function resetPasswordRequest(
  token: string,
  password: string,
): Promise<{ access_token: string }> {
  const { data } = await api.post("/password/reset", {
    token,
    password,
    password_confirmation: password,
  });
  return data;
}
