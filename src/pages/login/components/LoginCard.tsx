import { User, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";

export default function LoginCard() {
  const { login, isLoading, error, clearError } = useAuthContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/inicio", { replace: true });
    } catch {
      // El error ya vive en el contexto, no hace falta nada aquí
    }
  };

  return (
    <div className="bg-[#FFFFFF]/80 p-8 rounded-2xl shadow-lg w-[90%] max-w-md border border-[#691B31]/40">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-[#691B31]">

        {/* Usuario */}
        <div>
          <label className="block text-sm font-semibold mb-2">Usuario</label>
          <div className="flex items-center border border-[#FFFFFF] rounded-xl px-3 py-2 bg-white">
            <User className="text-[#691B31] mr-2" size={18} />
            <input
              name="email"
              type="email"
              placeholder="Ingrese su correo"
              value={form.email}
              onChange={handleChange}
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40"
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-semibold mb-2">Contraseña</label>
          <div className="flex items-center border border-[#FFFFFF] rounded-xl px-3 py-2 bg-white">
            <Lock className="text-[#691B31] mr-2" size={18} />
            <input
              name="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40"
              required
            />
          </div>
        </div>

        {/* Error de Laravel (ej: "Credenciales incorrectas") */}
        {error && (
          <p className="text-red-600 text-sm text-center font-medium -mt-2">
            {error}
          </p>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <button
            type="button"
            className="text-[#691B31] hover:text-[#5b132b]/50 transition-colors"
          >
            ¿Olvidó su contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 bg-[#691B31] hover:bg-[#DDC9A3] text-white font-bold py-2 rounded-xl transition-colors hover:text-[#691B31] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Accediendo..." : "Acceder"}
        </button>
      </form>
    </div>
  );
}