import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type PasswordStrengthProps = {
  password: string;
};

const requirements = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Una mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Una minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un número", test: (p: string) => /\d/.test(p) },
  { label: "Un símbolo", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const barOpacity: Record<number, string[]> = {
  0: ["opacity-10", "opacity-10", "opacity-10", "opacity-10"],
  1: ["opacity-30", "opacity-10", "opacity-10", "opacity-10"],
  2: ["opacity-50", "opacity-50", "opacity-10", "opacity-10"],
  3: ["opacity-70", "opacity-70", "opacity-70", "opacity-10"],
  4: ["opacity-90", "opacity-90", "opacity-90", "opacity-90"],
  5: ["opacity-100", "opacity-100", "opacity-100", "opacity-100"],
};

const strengthLabel: Record<number, string> = {
  0: "Muy débil",
  1: "Muy débil",
  2: "Débil",
  3: "Media",
  4: "Fuerte",
  5: "Muy fuerte",
};

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const checkedRequirements = useMemo(
    () => requirements.map((req) => ({ ...req, met: req.test(password) })),
    [password],
  );

  const score = useMemo(
    () => checkedRequirements.filter((r) => r.met).length,
    [checkedRequirements],
  );

  return (
    <div
      className={[
        "overflow-hidden transition-all duration-300 ease-in-out",
        password ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
      ].join(" ")}
    >
      <div className="flex flex-col gap-2 pt-1">
        {/* Barras */}
        <div className="flex gap-2">
          {barOpacity[score].map((opacity, i) => (
            <div
              key={i}
              className={[
                "h-2 flex-1 rounded-full bg-[#691B31] transition-all duration-300",
                opacity,
              ].join(" ")}
            />
          ))}
        </div>

        {/* Label */}
        <p className="text-xs font-semibold text-[#691B31]/70">
          Seguridad:{" "}
          <span className="font-extrabold text-[#691B31]">
            {strengthLabel[score]}
          </span>
        </p>

        {/* Requisitos en 2 columnas */}
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
          {checkedRequirements.map((req) => (
            <li
              key={req.label}
              className={[
                "text-xs flex items-center gap-1 font-medium transition-colors duration-200",
                req.met ? "text-[#691B31]" : "text-[#691B31]/30",
              ].join(" ")}
            >
              {req.met ? (
                <CheckCircle2 size={11} className="shrink-0" />
              ) : (
                <Circle size={11} className="shrink-0" />
              )}
              <span className="truncate">{req.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
