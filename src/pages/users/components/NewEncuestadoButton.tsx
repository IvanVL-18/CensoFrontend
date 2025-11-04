import { PlusCircle } from "lucide-react";

type NewEncuestadoButtonProps = {
  onClick: () => void;
};

const NewEncuestadoButton = ({ onClick }: NewEncuestadoButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-r from-[#F5D0A9] to-[#F1C27D] text-white px-5 py-2 rounded-full flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:from-[#F1C27D] hover:to-[#F5D0A9] transition-all duration-300"
      aria-label="Crear nuevo encuestado"
    >
      <PlusCircle size={24} />
      <span className="text-lg font-semibold">Nuevo Encuestado</span>
    </button>
  );
};

export default NewEncuestadoButton;
