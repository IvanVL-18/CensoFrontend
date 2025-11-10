// src/components/NewEncuestadoButton.tsx
import { PlusCircle } from "lucide-react";

type NewEncuestadoButtonProps = {
  onClick: () => void;
};

const NewEncuestadoButton = ({ onClick }: NewEncuestadoButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="
        group
        flex items-center justify-start
        bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B]
        text-white font-medium
        h-10 w-10 overflow-hidden rounded-md shadow-md
        transition-all duration-300 ease-out
        hover:w-44 focus:w-44
      "
      aria-label="Crear nuevo encuestado"
    >
      <div className="flex items-center justify-center w-10 shrink-0">
        <PlusCircle
          className="text-white"
          size={22}
          strokeWidth={2.5}
        />
      </div>
      <span
        className="
          whitespace-nowrap opacity-0 translate-x-4
          transition-all duration-300 ease-out
          group-hover:opacity-100 group-hover:translate-x-0
          group-focus:opacity-100 group-focus:translate-x-0
          ml-2
        "
      >
        Nuevo Encuestado
      </span>
    </button>
  );
};

export default NewEncuestadoButton;
