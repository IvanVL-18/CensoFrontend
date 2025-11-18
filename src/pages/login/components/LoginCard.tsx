import { User, Lock, UserPlus } from "lucide-react";
import { useState } from "react";

export default function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Usuario:", username);
    console.log("Contraseña:", password);
  };

  return (
    <div className="bg-[#691B31]/90 p-8 rounded-2xl shadow-lg w-[90%] max-w-md border border-[#691B31]/30">
      <form onSubmit={handleLogin} className="flex flex-col gap-6 text-[#5b132b]">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Usuario
          </label>
          <div className="flex items-center bg-[#FFFFFF]/60 rounded-xl px-3 py-2">
            <User className="text-white mr-2" size={18} />
            <input
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent outline-none w-full text-white placeholder-gray-300"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Contraseña
          </label>
          <div className="flex items-center bg-[#FFFFFF]/60 rounded-xl px-3 py-2">
            <Lock className="text-white mr-2" size={18} />
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full text-white placeholder-gray-300"
              required
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <button
            type="button"
            className="text-white hover:text-[#DDC9A3] transition-colors"
          >
            ¿Olvidó su contraseña?
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-white hover:text-[#DDC9A3] transition-colors"
          >
            <UserPlus size={16} /> Agregar usuario
          </button>
        </div>

        <button
          type="submit"
          className="mt-6 bg-white hover:bg-[#DDC9A3] text-[#691b31] font-bold py-2 rounded-xl transition-colors"
        >
          Acceder
        </button>
      </form>
    </div>
  );
}
