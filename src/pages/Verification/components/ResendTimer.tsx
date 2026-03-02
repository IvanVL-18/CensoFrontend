import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Clock } from "lucide-react";
import type { ResendTimerProps } from "../Verification.types";

export default function ResendTimer({ seconds = 60, onResend }: ResendTimerProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [left]);

  const canResend = left <= 0;

  const label = useMemo(() => {
    if (canResend) return "Reenviar código";
    return `Reenviar en ${left}s`;
  }, [canResend, left]);

  return (
    <button
      type="button"
      onClick={() => {
        if (!canResend) return;
        onResend();
        setLeft(seconds);
      }}
      disabled={!canResend}
      className={[
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition shadow-sm",
        canResend
          ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          : "cursor-not-allowed bg-slate-200 text-slate-500",
      ].join(" ")}
    >
      {canResend ? <RefreshCw className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      {label}
    </button>
  );
}