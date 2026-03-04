import { useMemo, useState } from "react";
import { ShieldCheck, Mail, Smartphone, BadgeCheck } from "lucide-react";
import VerificationLayout from "./VerificationLayout";
import OtpInput from "./OtpInput";
import ResendTimer from "./ResendTimer";
import type { VerificationCardProps } from "../Verification.types";

function maskDestination(dest?: string) {
  if (!dest) return "";
  if (dest.includes("@")) {
    const [user, domain] = dest.split("@");
    const u = user.length <= 2 ? user : `${user.slice(0, 2)}***${user.slice(-1)}`;
    return `${u}@${domain}`;
  }

  const digits = dest.replace(/\D/g, "");
  if (digits.length >= 7) return `*** *** ${digits.slice(-4)}`;
  return dest;
}

export default function VerificationCard({
  title = "Verificación de código",
  subtitle = "Ingresa el código de 6 dígitos que te enviamos",
  destination,
  onVerified,
}: VerificationCardProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const masked = useMemo(() => maskDestination(destination), [destination]);
  const isPhone = useMemo(() => (destination ? !destination.includes("@") : false), [destination]);

  const canSubmit = code.length === 6 && !loading;

  async function handleVerify() {
    if (!canSubmit) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      await new Promise((r) => setTimeout(r, 700));
      setSuccess(true);
      onVerified?.(code);
    } catch (e: any) {
      setErrorMsg(e?.message || "No se pudo verificar el código.");
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setErrorMsg(null);
    setSuccess(false);
  }

  return (
    <VerificationLayout>
      <div className="w-full max-w-[520px]">
        <div className="mb-5 flex items-center justify-between">
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-25px_rgba(2,6,23,.35)]">
          <div className="h-2 bg-[#7A1F3D]" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7A1F3D]/10">
                <ShieldCheck className="h-6 w-6 text-[#7A1F3D]" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

                {destination ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    {isPhone ? <Smartphone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    Enviado a: <span className="font-extrabold">{masked}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-7 text-center">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Código de verificación
              </label>

              <div className="flex justify-center">
                <OtpInput value={code} onChange={setCode} length={6} disabled={loading} />
              </div>
            </div>

            {errorMsg ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <span className="font-extrabold">Error:</span> {errorMsg}
              </div>
            ) : null}

            {success ? (
              <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <BadgeCheck className="h-5 w-5" />
                Código verificado correctamente.
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="w-full sm:flex-1">
                <ResendTimer seconds={60} onResend={handleResend} />
              </div>

              <div className="w-full sm:flex-1">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!canSubmit}
                  className={[
                    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
                    "transition shadow-sm",
                    canSubmit
                      ? "bg-[#7A1F3D] text-white hover:brightness-110 active:brightness-95"
                      : "cursor-not-allowed bg-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {loading ? "Verificando..." : "Confirmar código"}
                </button>
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Aviso de seguridad</p>
              <p className="mt-1">
                Por tu protección, el código es de un solo uso y tiene vigencia limitada. No compartas
                este código con terceros.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-500">
          Plataforma institucional ·{" "}
          <span className="font-semibold text-slate-600">Gestión de acceso</span>
        </div>
      </div>
    </VerificationLayout>
  );
}