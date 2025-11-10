import { Search, PlusCircle } from "lucide-react";

type HeaderModuleProps = {
  title: string;
  onAddClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
};

// Botón expandible inline (ícono + siempre visible)
function ExpandAddButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Agregar nuevo"
      className="
        group
        inline-flex items-center justify-start
        h-10 w-10
        overflow-hidden rounded-md shadow-md
        bg-gradient-to-r from-[#B49060] via-[#C3A67C] to-[#D4C09B]
        text-white font-medium
        transition-[width] duration-300 ease-out
        hover:w-44 focus:w-44
        shrink-0
      "
    >
      <div className="flex items-center justify-center w-10 shrink-0">
        <PlusCircle
          size={22}
          strokeWidth={2.5}
          className="text-white"
          style={{ color: "#ffffff", stroke: "#ffffff" }}
        />
      </div>

      <span
        className="
          ml-2 pr-3
          whitespace-nowrap
          opacity-0 translate-x-4
          transition-all duration-300 ease-out
          group-hover:opacity-100 group-hover:translate-x-0
          group-focus:opacity-100 group-focus:translate-x-0
        "
      >
        Nuevo Encuestado
      </span>
    </button>
  );
}

const HeaderModule = ({
  title,
  onAddClick,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: HeaderModuleProps) => {
  return (
    <div
      className="
        w-full bg-[#691B31] text-white
        flex flex-col gap-3
        sm:flex-row sm:items-center sm:justify-between
        px-6 py-3 rounded-t-lg shadow-md
      "
    >
      {/* Título */}
      <h2 className="text-lg font-semibold tracking-wide">{title}</h2>

      {/* Contenedor derecho (buscador + botón) */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Buscador con ancho fijo y sin shrink para dejar espacio al botón */}
        <div
          className="
            flex items-stretch
            w-[20rem] max-w-full shrink-0
            bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden
            transition-all duration-300 ease-in-out
            focus-within:ring-2 focus-within:ring-[#B49060]
            hover:shadow-md
          "
        >
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
            className="
              flex-grow px-3 py-2
              bg-transparent text-sm text-gray-800 placeholder-gray-400
              focus:outline-none
            "
          />
          <button
            onClick={onSearchSubmit}
            aria-label="Buscar"
            className="
              flex items-center justify-center
              w-10 bg-[#EAEAEA] hover:bg-[#DADADA]
              border-l border-gray-300 transition-all duration-300
            "
          >
            <Search size={17} strokeWidth={2} className="text-gray-600" />
          </button>
        </div>

        {/* Botón expandible */}
        <ExpandAddButton onClick={onAddClick} />
      </div>
    </div>
  );
};

export default HeaderModule;
