import React from "react";
import "/src/assets/global-variables.css";

type Props = {
  label: string;
  logoSrc?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "sm" | "md";
  showStateText?: boolean;
};

const GovSwitch: React.FC<Props> = ({ 
  label,
  logoSrc = "/Estrella_header.svg",
  checked,
  onCheckedChange,
  size = "md",
  showStateText = true,
}) => {
  const colorVino = "#611232";
  const colorGris = "#D1D5DB";

  const trackClass =
    size === "sm" ? "h-7 w-14" : "h-8 w-16";
  const thumbClass =
    size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const translateClass =
    size === "sm"
      ? checked
        ? "translate-x-8"
        : "translate-x-1"
      : checked
      ? "translate-x-9"
      : "translate-x-1";
  const imgClass = size === "sm" ? "h-3.5" : "h-4";

  return (
    <div className="flex items-center gap-3 font-sans">
      {showStateText && (
        <span className={`text-sm ${!checked ? "text-red-900 font-bold" : "text-gray-400"}`}>
          Desactivado
        </span>
      )}

      <button
        type="button"
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9D2449] ${trackClass}`}
        style={{ backgroundColor: checked ? colorVino : colorGris }}
      >
        <span className="sr-only">{label}</span>

        <span
          className={`${translateClass} inline-grid place-items-center transform rounded-full bg-white transition-transform duration-300 ease-in-out overflow-hidden ${thumbClass}`}
        >
          <img
            src={logoSrc}
            alt="Logo"
            className={`${imgClass} w-auto object-contain transition-opacity ${
              checked ? "opacity-100" : "opacity-40"
            }`}
            style={{ filter: checked ? "none" : "grayscale(100%)" }}
            draggable={false}
          />
        </span>
      </button>

      {showStateText && (
        <span className={`text-sm ${checked ? "text-red-900 font-bold" : "text-gray-400"}`}>
          Activado
        </span>
      )}
    </div>
  );
};

export default GovSwitch;