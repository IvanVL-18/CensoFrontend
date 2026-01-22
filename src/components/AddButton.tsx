import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  label: string;              // "Agregar Institución", "Agregar Censo", etc.
  onClick: () => void;
  icon?: ReactNode;           // opcional, por si un día quieres otro icono
  className?: string;         // por si quieres ajustar estilos en casos especiales
  buttonType?: "button" | "submit";
};

export default function AddButton({
  label,
  onClick,
  icon,
  className,
  buttonType = "button",
}: Props) {
  return (
    <button
      type={buttonType}
      onClick={onClick}
      className={clsx(
        `
        bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B]
        text-white font-semibold
        h-10 rounded-lg shadow
        hover:brightness-95
        flex items-center
        group
        transition-all duration-300 ease-in-out
        p-[9px]
        group-hover:px-4 group-active:px-4
        `,
        className
      )}
    >
      {/* Icono */}
      <span className="flex-shrink-0">
        {icon ?? (
          // Si no le pasas icon, no renderiza nada extra
          null
        )}
      </span>

      {/* Texto animado */}
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
