import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import {
  verifyTokenRequest,
  resetPasswordRequest,
} from "../ResetPassword.service.ts";
import type { TokenStatus } from "../ResetPassword.types";

export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuthContext();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");

  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }

    window.history.replaceState({}, "", "/reset-password");

    verifyTokenRequest(token)
      .then(() => setTokenStatus("valid"))
      .catch(() => setTokenStatus("invalid"));
  }, []);

  async function handlePasswordReset({ password }: { password: string }) {
    try {
      const { access_token } = await resetPasswordRequest(token, password);
      await loginWithToken(access_token);
      setTimeout(() => navigate("/inicio"), 3000);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "El enlace podría ser inválido o haber caducado.",
      );
    }
  }

  return { tokenStatus, handlePasswordReset };
}
