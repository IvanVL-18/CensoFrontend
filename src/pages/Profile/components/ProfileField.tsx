import type { LucideIcon } from "lucide-react";

interface ProfileFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  className?: string;
  error?: string;
  numbersOnly?: boolean;
}

export default function ProfileField({
  label,
  icon: Icon,
  value,
  onChange,
  maxLength,
  className,
  error,
  numbersOnly,
}: ProfileFieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Icon className="h-4 w-4" />
        </span>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          onKeyDown={(e) => {
            if (
              numbersOnly &&
              !/^\d$/.test(e.key) &&
              !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
            ) {
              e.preventDefault();
            }
          }}
          className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/40 focus:border-[var(--pantone-7421)] ${
            error ? "border-red-400" : "border-slate-200"
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}