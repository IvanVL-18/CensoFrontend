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
    <div className="bg-[#FFFFFF]/80 p-8 rounded-2xl shadow-lg w-[90%] max-w-md border border-[#691B31]/40">
      <form onSubmit={handleLogin} className="flex flex-col gap-6 text-[#691B31]">
        
        {/* Usuario */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Usuario
          </label>
          <div className="flex items-center border border-[#FFFFFF] rounded-xl px-3 py-2 bg-white">
            <User className="text-[#691B31] mr-2" size={18} />
            <input
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40"
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Contraseña
          </label>
          <div className="flex items-center border border-[#FFFFFF] rounded-xl px-3 py-2 bg-white">
            <Lock className="text-[#691B31] mr-2" size={18} />
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40"
              required
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <button
            type="button"
            className="text-[#691B31] hover:text-[#5b132b]/50 transition-colors"
          >
            ¿Olvidó su contraseña?
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-[#691B31] hover:text-[#5b132b]/50 transition-colors"
          >
            <UserPlus size={16} /> Agregar usuario
          </button>
        </div>

        <button
          type="submit"
          className="mt-6 bg-[#691B31] hover:bg-[#DDC9A3] text-white font-bold py-2 rounded-xl transition-colors hover:text-[#691B31]"
        >
          Acceder
        </button>
      </form>
    </div>
  );
}
