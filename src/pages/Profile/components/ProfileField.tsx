import type { ProfileFieldProps as Props } from "../Profile.types";

export default function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  className,
}: Props) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/30 focus:border-[var(--pantone-7421)]"
      />
    </div>
  );
}