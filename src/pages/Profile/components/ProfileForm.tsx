import type { ProfileFormProps as Props } from "../Profile.types";

export default function ProfileForm({
  label,
  placeholder,
  value,
  onChange,
  helper,
  className,
}: Props) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base sm:text-xs text-gray-800 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
      />

      {helper ? (
        <p className="mt-1 text-[10px] text-gray-500">{helper}</p>
      ) : null}
    </div>
  );
}