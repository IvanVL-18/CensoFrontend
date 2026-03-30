import type { LucideIcon } from "lucide-react";

interface ProfileFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  className?: string;
}

export default function ProfileField({
  label,
  icon: Icon,
  value,
  onChange,
  maxLength,
  className,
}: ProfileFieldProps) {
  // Genera un id estable a partir del label
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

  return (
    <div className={className}>
      <label
        htmlFor={id}                          // ← asocia el label al input
        className="block text-xs font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Icon className="h-4 w-4" />
        </span>
        <input
          id={id}                             // ← id coincide con htmlFor
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/40 focus:border-[var(--pantone-7421)]"
        />
      </div>
    </div>
  );
}