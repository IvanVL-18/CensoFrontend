import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
  buttonType?: "button" | "submit";
  // Añadimos la opción de variante
  variant?: "gold" | "green"; 
};

export default function AddButton({
  label,
  onClick,
  icon,
  className,
  buttonType = "button",
  variant = "gold", 
}: Props) {
  
  const variantStyles = {
    gold: "bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B]",
    green: "bg-gradient-to-r from-[#174a2b] via-[#1b6939] to-[#2d8a4e]" 
  };

  return (
    <button
      type={buttonType}
      onClick={onClick}
      className={clsx(
        `
        text-white font-semibold
        h-10 rounded-lg shadow
        hover:brightness-110
        flex items-center
        group
        transition-all duration-300 ease-in-out
        p-[9px]
        hover:px-4 active:px-4
        `,
        variantStyles[variant], 
        className
      )}
    >

      <span className="flex-shrink-0">
        {icon ?? null}
      </span>

      <span
        className="
          w-0 ml-0 opacity-0
          whitespace-nowrap
          overflow-hidden
          transition-all duration-300 ease-in-out
          group-hover:w-auto group-hover:ml-2 group-hover:opacity-100
          group-active:w-auto group-active:ml-2 group-active:opacity-100
        "
      >
        {label}
      </span>
    </button>
  );
}