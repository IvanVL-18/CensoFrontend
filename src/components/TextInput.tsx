import React, { useId } from "react";
import { X } from "lucide-react";

type Size = "sm" | "md";

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;

  type?: React.HTMLInputTypeAttribute;
  name?: string;
  id?: string;

  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;

  leftIcon?: React.ReactNode;
  clearable?: boolean;

  size?: Size;
  className?: string;
  inputClassName?: string;
};

export default function TextInput({
  value,
  defaultValue,
  onChange,

  label,
  placeholder,
  helperText,
  error,

  type = "text",
  name,
  id,

  disabled = false,
  required = false,
  autoComplete,
  maxLength,

  leftIcon,
  clearable = false,

  size = "md",
  className = "",
  inputClassName = "",
}: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const isControlled = value !== undefined;

  const base = [
    "w-full rounded-lg border bg-white shadow-sm",
    "text-slate-900 placeholder:text-slate-400",
    "focus:outline-none focus:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "transition",
  ].join(" ");

  const sizeCls =
    size === "sm"
      ? "h-9 text-sm px-3"
      : "h-10 text-sm px-3";

  const withIcon = leftIcon ? "pl-9" : "";
  const withClear = clearable ? "pr-9" : "";

  const borderCls = error ? "border-red-300" : "border-[#D6C2A8]";
  const ringCls = error ? "focus:ring-red-300" : "focus:ring-[#D6C2A8]";

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-900">
          {label} {required ? <span className="text-[#7A1E2C]">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          className={[
            base,
            sizeCls,
            borderCls,
            ringCls,
            withIcon,
            withClear,
            inputClassName,
          ].join(" ")}
        />

        {clearable && !disabled && (value ?? defaultValue ?? "") ? (
          <button
            type="button"
            onClick={() => onChange?.("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-slate-100"
            aria-label="Limpiar"
            title="Limpiar"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-600">{helperText}</p>
      ) : null}
    </div>
  );
}