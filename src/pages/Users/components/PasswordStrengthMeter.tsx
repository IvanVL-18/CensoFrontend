import { Shield } from "lucide-react";

const RULES = [
  {
    key: "len8",
    label: "Mínimo 8 caracteres",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "num",
    label: "Al menos un número",
    test: (p: string) => /\d/.test(p),
  },
  {
    key: "upper",
    label: "Al menos una mayúscula",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    key: "lower",
    label: "Al menos una minúscula",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    key: "special",
    label: "Al menos un carácter especial",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const x = Math.max(0, Math.min(1, t));
  const r = Math.round(A.r + (B.r - A.r) * x);
  const g = Math.round(A.g + (B.g - A.g) * x);
  const bl = Math.round(A.b + (B.b - A.b) * x);
  return `rgb(${r}, ${g}, ${bl})`;
}

function getStrength(password: string) {
  const passed = RULES.map((r) => r.test(password));
  const base = passed.filter(Boolean).length;
  const bonus = password.length >= 12 ? 1 : 0;
  const score = clamp(base + bonus, 0, 6);
  const percent = Math.round((score / 6) * 100);

  let label = "Muy débil";
  if (score >= 2) label = "Débil";
  if (score >= 3) label = "Media";
  if (score >= 5) label = "Fuerte";
  if (score >= 6) label = "Muy fuerte";

  return { passed, percent, label, score };
}

export default function PasswordStrengthMeter({
  password,
  className = "",
  showRules = true,
}: {
  password: string;
  className?: string;
  showRules?: boolean;
}) {
  const p = password ?? "";
  const isEmpty = p.length === 0;
  const { passed, percent, label,} = getStrength(p);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Seguridad:</span>
          <span className={isEmpty ? "text-slate-400" : "text-slate-900"}>
            {isEmpty ? "—" : label}
          </span>
        </div>

        <div className="text-xs text-slate-500">
          {isEmpty ? "" : `${percent}%`}
        </div>
      </div>

      {(() => {
        const fillColor = isEmpty
          ? "transparent"
          : mixHex("#ef4444", "#22c55e", percent / 100); 

        return (
          <div className="mt-2 h-[3px] w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${isEmpty ? 0 : percent}%`,
                backgroundColor: fillColor,
              }}
            />
          </div>
        );
      })()}

      {showRules && (
        <div className="mt-2 space-y-1">
          {isEmpty ? (
            <p className="text-xs text-red-600">
              La contraseña es obligatoria.
            </p>
          ) : (
            RULES.map((r, idx) =>
              !passed[idx] ? (
                <p key={r.key} className="text-xs text-red-600">
                  {r.label}
                </p>
              ) : null,
            )
          )}
        </div>
      )}
    </div>
  );
}
