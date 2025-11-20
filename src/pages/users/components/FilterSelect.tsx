// src/components/common/FilterSelect.tsx
interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  placeholder: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: FilterSelectProps) {
  const base =
    "w-full md:w-48 border border-[#DDC9A3] bg-[#DDC9A3]/60 text-sm text-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#691B31]";

  return (
    <select
      className={base}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
