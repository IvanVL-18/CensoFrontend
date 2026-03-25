import type { ProfileFieldProps as Props } from "../Profile.types";

export default function ProfileField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  maxLength,
  className,
}: Props & { icon?: any }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-lg border border-slate-200 bg-white ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 py-2 text-base sm:text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/25 focus:border-[var(--pantone-7421)]`}
        />
      </div>
    </div>
  );
}