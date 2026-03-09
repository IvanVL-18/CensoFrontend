import { useMemo, useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import ResetPasswordLayout from "./ResetPasswordLayout";
import PasswordStrength from "./PasswordStrength";
import type { ResetPasswordCardProps } from "../ResetPassword.types";

function maskEmail(email?: string) {
  if (!email) return "";
  if (!email.includes("@")) return email;

  const [user, domain] = email.split("@");
  const maskedUser =
    user.length <= 2 ? user : `${user.slice(0, 2)}***${user.slice(-1)}`;

  return `${maskedUser}@${domain}`;
}

export default function ResetPasswordCard({
  title = "Restablecer contraseña",
  subtitle = "Crea una nueva contraseña segura para tu cuenta",
  email,
  onSubmit,
}: ResetPasswordCardProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canSubmit =
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    passwordsMatch &&
    !loading;

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    setSuccess(false);

    try {
      await new Promise((r) => setTimeout(r, 700));
      setSuccess(true);
      onSubmit?.({ password, confirmPassword });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetPasswordLayout>
      <div className="w-full max-w-[520px]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-25px_rgba(2,6,23,.35)]">
          <div className="h-2 bg-[#7A1F3D]" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7A1F3D]/10">
                <LockKeyhole className="h-6 w-6 text-[#7A1F3D]" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

                {email ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    <ShieldCheck className="h-4 w-4" />
                    Cuenta: <span className="font-extrabold">{maskedEmail}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#7A1F3D]/40 focus:ring-2 focus:ring-[#7A1F3D]/20 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <PasswordStrength password={password} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#7A1F3D]/40 focus:ring-2 focus:ring-[#7A1F3D]/20 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 ? (
                  <p
                    className={[
                      "mt-2 text-xs font-semibold",
                      passwordsMatch ? "text-emerald-600" : "text-red-600",
                    ].join(" ")}
                  >
                    {passwordsMatch
                      ? "Las contraseñas coinciden."
                      : "Las contraseñas no coinciden."}
                  </p>
                ) : null}
              </div>
            </div>

            {success ? (
              <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <BadgeCheck className="h-5 w-5" />
                Contraseña restablecida correctamente.
              </div>
            ) : null}

            <div className="mt-7">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={[
                  "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                  "transition shadow-sm",
                  canSubmit
                    ? "bg-[#7A1F3D] text-white hover:brightness-110 active:brightness-95"
                    : "cursor-not-allowed bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                {loading ? "Restableciendo..." : "Restablecer contraseña"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ResetPasswordLayout>
  );
}