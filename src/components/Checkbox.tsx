import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Minus } from "lucide-react";

type Size = "sm" | "md";

type Props = {
  checked?: boolean;                
  defaultChecked?: boolean;          
  onChange?: (checked: boolean) => void;

  indeterminate?: boolean;         
  disabled?: boolean;

  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;

  name?: string;
  value?: string;

  size?: Size;
  className?: string;
};

export default function Checkbox({
  checked,
  defaultChecked = false,
  onChange,

  indeterminate = false,
  disabled = false,

  label,
  description,
  error,

  name,
  value,

  size = "md",
  className = "",
}: Props) {
  const id = useId();
  const isControlled = checked !== undefined;

  const [internal, setInternal] = useState<boolean>(defaultChecked);
  const isChecked = isControlled ? checked : internal;

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate) && !Boolean(isChecked);
    }
  }, [indeterminate, isChecked]);

  const dims = useMemo(() => {
    return size === "sm"
      ? { box: "h-4 w-4", icon: "h-3.5 w-3.5", text: "text-sm" }
      : { box: "h-5 w-5", icon: "h-4 w-4", text: "text-sm" };
  }, [size]);

  const borderColor = error ? "border-red-300" : "border-[#D6C2A8]";
  const ringColor = error ? "focus:ring-red-300" : "focus-[#D6C2A8]";

  const setNext = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <label
      className={[
        "flex gap-3 select-none",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      ].join(" ")}
      htmlFor={id}
    >
      <span className="relative mt-[2px]">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          name={name}
          value={value}
          checked={Boolean(isChecked)}
          disabled={disabled}
          onChange={(e) => setNext(e.target.checked)}
          className="sr-only"
        />

        <span
          aria-hidden="true"
          className={[
            "grid place-items-center rounded-md border bg-white shadow-sm",
            "transition",
            dims.box,
            borderColor,
            disabled ? "" : "hover:bg-slate-50",
            isChecked || indeterminate ? "bg-white border-[#D6C2A8]" : "",
            "focus-within:ring-2",
            ringColor,
          ].join(" ")}
        >
          {indeterminate && !isChecked ? (
            <Minus className={`${dims.icon} text-[#7A1E2C]`} />
          ) : isChecked ? (
            <Check className={`${dims.icon} text-[#7A1E2C]`} />
          ) : null}
        </span>
      </span>

      <span className="min-w-0">
        {label ? <div className={`${dims.text} font-medium text-slate-900`}>{label}</div> : null}
        {description ? <div className="text-xs text-slate-600">{description}</div> : null}
        {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
      </span>
    </label>
  );
}