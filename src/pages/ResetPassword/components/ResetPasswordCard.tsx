import { useMemo, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { resetPasswordSchema } from "../schemas/ResetPassword.schema";
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

const MAX_PASSWORD_LENGTH = 128;

export default function ResetPasswordCard({
  title = "Actualizar Contraseña",
  subtitle = "Ingresa tu nueva contraseña.",
  email,
  onSubmit,
}: ResetPasswordCardProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maskedEmail = maskEmail(email);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canSubmit =
    resetPasswordSchema.safeParse({ password }).success &&
    passwordsMatch &&
    !loading;

  function handlePasswordChange(value: string) {
    setPassword(value);
    setSuccess(false);
    setErrorMessage(null);
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    setSuccess(false);
    setErrorMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      if (onSubmit) {
        await onSubmit({ password });
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setSuccess(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al restablecer la contraseña. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#FFFFFF]/80 p-8 rounded-2xl shadow-lg w-[90%] max-w-md border border-[#691B31]/40 text-[#691B31]">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>
        <p className="text-sm text-center text-[#691B31]/70">{subtitle}</p>

        {email ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white border border-[#691B31]/20 px-3 py-1.5 text-xs font-semibold text-[#691B31]">
            <ShieldCheck className="h-4 w-4" />
            Cuenta: <span className="font-extrabold">{maskedEmail}</span>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nueva Contra */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-semibold mb-2"
          >
            Nueva
          </label>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2 relative">
            <Lock className="text-[#691B31] mr-2 shrink-0" size={18} />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
              maxLength={MAX_PASSWORD_LENGTH}
              autoComplete="new-password"
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40 pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute right-3 text-[#691B31]/60 hover:text-[#691B31] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-3">
            <PasswordStrength password={password} />
          </div>
        </div>

        {/* Confirmar Contra */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-semibold mb-2"
          >
            Confirmar
          </label>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2 relative">
            <Lock className="text-[#691B31] mr-2 shrink-0" size={18} />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              placeholder="Repita su contraseña"
              disabled={loading}
              maxLength={MAX_PASSWORD_LENGTH}
              autoComplete="new-password"
              className="bg-transparent outline-none w-full text-[#691B31] placeholder-[#691B31]/40 pr-8"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmación"
                  : "Mostrar confirmación"
              }
              className="absolute right-3 text-[#691B31]/60 hover:text-[#691B31] transition-colors"
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
                "mt-2 text-xs font-semibold text-center",
                passwordsMatch ? "text-[#691B31]" : "text-red-600",
              ].join(" ")}
            >
              {passwordsMatch
                ? "Las contraseñas coinciden."
                : "Las contraseñas no coinciden."}
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {errorMessage}
          </div>
        ) : null}

        {success ? (
          <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-green-700">
            <BadgeCheck className="h-5 w-5" />
            Contraseña restablecida correctamente.
          </div>
        ) : null}

        <div className="mt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "flex w-full items-center justify-center rounded-xl px-4 py-2 font-bold transition-colors",
              canSubmit
                ? "bg-[#691B31] text-white hover:bg-[#DDC9A3] hover:text-[#691B31]"
                : "cursor-not-allowed bg-[#691B31]/50 text-white/60",
            ].join(" ")}
          >
            {loading ? "Restableciendo..." : "Restablecer"}
          </button>
        </div>
      </form>
    </div>
  );
}
