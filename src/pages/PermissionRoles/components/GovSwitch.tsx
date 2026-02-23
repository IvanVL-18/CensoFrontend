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
  showStateText = true,
}) => {
  const colorVino = "#611232";
  const colorGris = "#D1D5DB";

  return (
    <div className="flex items-center gap-4 font-sans">
      {showStateText && (
        <span className={`text-sm ${!checked ? "text-red-900 font-bold" : "text-gray-400"}`}>
          Desactivado
        </span>
      )}

      <button
        type="button"
        onClick={() => onCheckedChange(!checked)}
        className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9D2449]"
        style={{ backgroundColor: checked ? colorVino : colorGris }}
      >
        <span className="sr-only">{label}</span>

        <span
          className={`${
            checked ? "translate-x-9" : "translate-x-1"
          } inline-grid place-items-center h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ease-in-out overflow-hidden`}
        >
          <img
            src={logoSrc}
            alt="Logo"
            className={`h-4 w-auto object-contain transition-opacity ${
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