import { User, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/Axios";

export default function ForgotPasswordCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/password/send-email", {
        email: email,
      });

      setMessage(
        "Se ha enviado un enlace de recuperación a tu correo electrónico.",
      );
      setEmail("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Verifica tu correo electrónico.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF]/80 p-8 rounded-2xl shadow-lg w-[90%] max-w-md border border-[#691B31]/40">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[#691B31] mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-sm text-[#691B31]/70">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para
          restablecer tu acceso.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 text-[#691B31]"
      >
        {/* Input de Correo */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Correo electrónico
          </label>
          <div className="flex items-center border border-[#FFFFFF] rounded-xl px-3 py-2 bg-white">
            <User className="text-[#691B31] mr-2" size={18} />
            <input
              name="email"
              type="email"
              placeholder="Ingrese su correo"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40"
              required
            />
          </div>
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <p className="text-red-600 text-sm text-center font-medium -mt-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-800 text-sm text-center font-medium -mt-2 p-2">
            {message}
          </p>
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex items-center justify-center gap-2 bg-[#691B31] hover:bg-[#DDC9A3] text-white font-bold py-2 rounded-xl transition-colors hover:text-[#691B31] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            "Enviando..."
          ) : (
            <>
              <Send size={18} />
              Enviar enlace
            </>
          )}
        </button>

        {/* Botón de Regresar */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-2 text-sm text-[#691B31] hover:text-[#5b132b]/60 transition-colors mt-2"
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
}
