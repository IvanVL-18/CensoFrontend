import { useMemo } from "react";

type PasswordStrengthProps = {
  password: string;
};

export default function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  const score = useMemo(() => {
    let value = 0;

    if (password.length >= 8) value++;
    if (/[A-Z]/.test(password)) value++;
    if (/[a-z]/.test(password)) value++;
    if (/\d/.test(password)) value++;
    if (/[^A-Za-z0-9]/.test(password)) value++;

    return value;
  }, [password]);

  const label =
    score <= 1
      ? "Muy débil"
      : score === 2
        ? "Débil"
        : score === 3
          ? "Media"
          : score === 4
            ? "Fuerte"
            : "Muy fuerte";

  const bars = [1, 2, 3, 4];

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        {bars.map((bar) => (
          <div
            key={bar}
            className={[
              "h-2 flex-1 rounded-full transition",
              score >= bar ? "bg-[#7A1F3D]" : "bg-slate-200",
            ].join(" ")}
          />
        ))}
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-600">
        Seguridad de la contraseña:{" "}
        <span className="text-[#7A1F3D]">{label}</span>
      </p>
    </div>
  );
}