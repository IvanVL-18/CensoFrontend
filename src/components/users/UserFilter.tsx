import { useState } from "react";

type UserFilterProps = {
  onSelect: (option: string) => void;
};

export default function UserFilter({ onSelect }: UserFilterProps) {
  const [selectedOption, setSelectedOption] = useState("encuestados");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOption(value);
    onSelect(value);
  };

  return (
    <div className="mb-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#420c1a] tracking-wide">
          Selecciona un tipo de usuario
        </h2>
        <div className="h-[2px] w-20 bg-[#b48a70] rounded-full"></div>
      </div>

      {/* Contenedor visual */}
      <div className="relative max-w-md">
        <select
          value={selectedOption}
          onChange={handleSelect}
          className="
            w-full appearance-none
            border border-[#b48a70]/50 rounded-xl
            bg-[#fdfaf6] text-[#420c1a]
            px-4 py-2.5 text-sm shadow-sm
            focus:outline-none focus:ring-2 focus:ring-[#b48a70]
            transition-all duration-200
          "
        >
          <option value="encuestados">Encuestados</option>
          <option value="administracion">Administración</option>
          <option value="managers">Managers</option>
        </select>

        {/* Flecha personalizada */}
        <div
          className="
            pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
            text-[#420c1a] opacity-70
          "
        >
          ▼
        </div>
      </div>

      {/* Pie de ayuda */}
      <p className="text-xs text-neutral-500 mt-2">
        Selecciona el tipo de usuario para visualizar su información en la tabla.
      </p>
    </div>
  );
}
