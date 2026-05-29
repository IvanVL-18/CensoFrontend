import { type ChangeEvent } from "react";

interface BaseProps {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  /** Cuántos caracteres antes del límite se considera "cerca" (default: 10) */
  nearLimitOffset?: number;
  onChange: (value: string) => void;
  /** Clases extra para el label (opcional) */
  labelClassName?: string;
  /** Ícono opcional antes del label */
  labelIcon?: React.ReactNode;
}

interface InputProps extends BaseProps {
  as?: "input";
}

interface TextareaProps extends BaseProps {
  as: "textarea";
  rows?: number;
}

type CharCountInputProps = InputProps | TextareaProps;

/* ── Helpers de color ─────────────────────────────────── */

function getColors(
  charCount: number,
  maxLength: number,
  nearLimitOffset: number,
  hasError: boolean,
) {
  const isNearLimit =
    charCount >= maxLength - nearLimitOffset && charCount < maxLength;
  const isAtLimit = charCount >= maxLength;

  const border = hasError
    ? "border-red-500 focus:ring-red-400"
    : isAtLimit
      ? "border-red-300 focus:ring-red-400"
      : isNearLimit
        ? "border-amber-300 focus:ring-amber-400"
        : "border-gray-300 focus:ring-[#DDC9A3]";

  const progress = isAtLimit
    ? "bg-red-500"
    : isNearLimit
      ? "bg-amber-500"
      : "bg-[#DDC9A3]";

  const counter = isAtLimit
    ? "text-red-600"
    : isNearLimit
      ? "text-amber-600"
      : "text-gray-500";

  return { border, progress, counter };
}

/* ── Componente ───────────────────────────────────────── */

export function CharCountInput(props: CharCountInputProps) {
  const {
    id,
    label,
    value,
    maxLength,
    placeholder,
    disabled = false,
    autoFocus = false,
    hasError = false,
    nearLimitOffset = 10,
    onChange,
    labelClassName = "block text-sm font-medium text-gray-700",
    labelIcon,
  } = props;

  const charCount = value.length;
  const { border, progress, counter } = getColors(
    charCount,
    maxLength,
    nearLimitOffset,
    hasError,
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value.slice(0, maxLength);
    onChange(newValue);
  };

  const baseInputClass = `border rounded-lg p-2 w-full focus:outline-none focus:ring-2 transition ${border}`;

  return (
    <div>
      {/* Label + contador */}
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className={labelClassName}>
          {labelIcon && (
            <span className="inline-flex items-center gap-1">
              {labelIcon}
              {label}
            </span>
          )}
          {!labelIcon && label}
        </label>
        <span className={`text-xs font-medium ${counter}`}>
          {charCount}/{maxLength} caracteres
        </span>
      </div>

      {/* Input o Textarea */}
      {props.as === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={props.rows ?? 3}
          maxLength={maxLength}
          disabled={disabled}
          className={`${baseInputClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          className={baseInputClass}
        />
      )}

      {/* Barra de progreso */}
      <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${progress}`}
          style={{ width: `${(charCount / maxLength) * 100}%` }}
        />
      </div>
    </div>
  );
}
