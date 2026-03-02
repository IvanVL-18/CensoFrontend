import { useEffect, useMemo, useRef } from "react";
import type { OtpInputProps } from "../Verification.types";

export default function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const clean = (value || "").replace(/\D/g, "").slice(0, length);
    const arr = clean.split("");
    while (arr.length < length) arr.push("");
    return arr;
  }, [value, length]);

  useEffect(() => {
    if (!value && inputsRef.current[0]) inputsRef.current[0].focus();
  }, [value]);

  function setAt(index: number, char: string) {
    const clean = (value || "").replace(/\D/g, "").slice(0, length).split("");
    clean[index] = char;
    const next = clean.join("").slice(0, length);
    onChange(next);
  }

  function handleChange(index: number, v: string) {
    const onlyDigits = v.replace(/\D/g, "");

    if (onlyDigits.length > 1) {
      const current = (value || "").replace(/\D/g, "");
      const left = current.slice(0, index);
      const right = current.slice(index + 1);
      const merged = (left + onlyDigits + right).slice(0, length);
      onChange(merged);

      const focusIndex = Math.min(index + onlyDigits.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    setAt(index, onlyDigits);

    if (onlyDigits && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();

      if (digits[index]) {
        setAt(index, "");
        return;
      }

      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setAt(index - 1, "");
      }
    }

    if (key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    if (key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const current = (value || "").replace(/\D/g, "");
    const left = current.slice(0, index);
    const right = current.slice(index + 1);
    const merged = (left + pasted + right).slice(0, length);
    onChange(merged);

    const focusIndex = Math.min(index + pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          onPaste={(e) => handlePaste(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onChange={(e) => handleChange(i, e.target.value)}
          className={[
            "h-14 w-12 rounded-2xl border text-center text-xl font-extrabold tracking-widest",
            "outline-none transition",
            "border-slate-200 bg-white text-slate-900",
            "focus:border-[#7A1F3D] focus:ring-4 focus:ring-[#7A1F3D]/15",
            disabled ? "cursor-not-allowed opacity-60" : "hover:border-slate-300",
          ].join(" ")}
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </div>
  );
}