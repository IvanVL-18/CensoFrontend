import { useState } from "react";
import Modal from "../../../components/ui/common/Modal";

export type NewEncuestadoPayload = {
  email: string;
  password: string;
  passwordConfirm: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewEncuestadoPayload) => void;
  loading?: boolean;
};

export default function NewEncuestadoModal({ open, onClose, onSubmit, loading }: Props) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const handleAccept = () => {
    if (!email.trim() || !pass || !pass2) return setErr("Completa todos los campos.");
    if (pass.length < 6) return setErr("La contraseña debe tener al menos 6 caracteres.");
    if (pass !== pass2) return setErr("Las contraseñas no coinciden.");
    setErr(null);
    onSubmit({ email: email.trim(), password: pass, passwordConfirm: pass2 });
  };

  return (
    <Modal open={open} onClose={onClose} title="¡Registro de nuevo encuestado!">
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Correo</label>
          <input
            type="email"
            value={email}
            placeholder="correo@dominio.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Contraseña</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full rounded-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Confirmar Contraseña</label>
          <input
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            className="w-full rounded-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {err && <p className="text-sm text-rose-600">{err}</p>}

        <div className="pt-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full rounded-full bg-[#5b1d27] text-white py-2 hover:opacity-50 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
