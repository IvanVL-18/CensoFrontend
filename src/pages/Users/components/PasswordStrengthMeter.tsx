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
  const { passed, percent, label, score } = getStrength(p);

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

      <div
        className={`h-full rounded-full transition-all duration-300 ${
          isEmpty
            ? "bg-transparent"
            : score <= 1
              ? "bg-red-500"
              : score === 2
                ? "bg-orange-500"
                : score === 3
                  ? "bg-yellow-400"
                  : score === 4
                    ? "bg-lime-500"
                    : "bg-green-500"
        }`}
        style={{ width: `${isEmpty ? 0 : percent}%` }}
      />

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
