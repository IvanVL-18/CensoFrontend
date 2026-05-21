import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/Axios";
import TopBar from "../login/components/TopBar";
import Footer from "../login/components/Footer";
import FallingEmblems from "../login/components/FallingEmblems";
import ResetPasswordCard from "./components/ResetPasswordCard";

type TokenStatus = "validating" | "valid" | "invalid";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!token || !email) {
      setTokenStatus("invalid");
      return;
    }

    // Para limpiar la url del token
    window.history.replaceState({}, "", "/reset-password");

    // Validamos el token en el backend
    api
      .post("/password/validate-token", { token, email })
      .then(() => setTokenStatus("valid"))
      .catch(() => setTokenStatus("invalid"));
  }, []);

  const handlePasswordReset = async ({ password }: { password: string }) => {
    try {
      await api.post("/password/reset", {
        token,
        email,
        password,
        password_confirmation: password,
      });

      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      console.error("Error al restablecer:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "El enlace podría ser inválido o haber caducado.",
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#691B31] text-white">
      <TopBar />

      <section className="relative flex-grow pt-10 pb-6">
        <FallingEmblems />

        <div className="relative z-10 mt-4 flex items-start justify-center">
          {tokenStatus === "validating" && (
            <p className="text-white/70 text-sm animate-pulse">
              Verificando enlace...
            </p>
          )}

          {tokenStatus === "invalid" && (
            <div className="bg-white/80 p-8 rounded-2xl shadow-lg w-[90%] max-w-md border border-[#691B31]/40 text-[#691B31] text-center flex flex-col gap-4">
              <p className="font-bold text-lg">Enlace inválido o expirado</p>
              <p className="text-sm text-[#691B31]/70">
                Este enlace ya fue usado o ha caducado. Solicita uno nuevo.
              </p>
              <button
                onClick={() => navigate("/Recuperar-password")}
                className="bg-[#691B31] text-white rounded-xl px-4 py-2 font-bold hover:bg-[#DDC9A3] hover:text-[#691B31] transition-colors"
              >
                Solicitar nuevo enlace
              </button>
            </div>
          )}

          {tokenStatus === "valid" && (
            <ResetPasswordCard email={email} onSubmit={handlePasswordReset} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
