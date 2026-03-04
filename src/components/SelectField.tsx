import { useId } from "react";
import { ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type Size = "sm" | "md";

type Props = {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;

  options: SelectOption[];

  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;

  name?: string;
  id?: string;

  disabled?: boolean;
  required?: boolean;

  size?: Size;
  className?: string;
  selectClassName?: string;
};

export default function SelectField({
  value,
  defaultValue,
  onChange,

  options,

  label,
  placeholder = "Selecciona una opción",
  helperText,
  error,

  name,
  id,

  disabled = false,
  required = false,

  size = "md",
  className = "",
  selectClassName = "",
}: Props) {
  const autoId = useId();
  const selectId = id ?? autoId;

  const isControlled = value !== undefined;

  const base = [
    "w-full rounded-lg border bg-white shadow-sm",
    "text-slate-900",
    "focus:outline-none focus:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "transition",
    "appearance-none",
  ].join(" ");

  const sizeCls = size === "sm" ? "h-9 text-sm pl-3 pr-10" : "h-10 text-sm pl-3 pr-10";
  const borderCls = error ? "border-red-300" : "border-[#D6C2A8]";
  const ringCls = error ? "focus:ring-red-300" : "focus:ring-[#D6C2A8]";

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-slate-900">
          {label} {required ? <span className="text-[#7A1E2C]">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          value={isControlled ? String(value ?? "") : undefined}
          defaultValue={!isControlled && defaultValue !== undefined ? String(defaultValue) : ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={[base, sizeCls, borderCls, ringCls, selectClassName].join(" ")}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-600">{helperText}</p>
      ) : null}
    </div>
  );
}