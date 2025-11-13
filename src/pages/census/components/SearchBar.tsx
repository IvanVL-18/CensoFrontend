import { Search } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSubmit?: () => void;
};

const SearchBar = ({ searchQuery, onSearchChange, onSubmit }: SearchBarProps) => {
  return (
    <div
      className="
        flex items-stretch
        w-full sm:w-[15rem]
        bg-white
        border border-gray-300
        rounded-md
        shadow-sm
        overflow-hidden
        transition-all duration-300 ease-in-out
        focus-within:ring-2 focus-within:ring-[#B49060]
        hover:shadow-md
      "
    >
      {/* Campo de texto */}
      <input
        type="text"
        placeholder="Buscar..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        className="
          flex-grow
          px-4 py-2.5
          bg-transparent
          text-sm text-gray-800
          placeholder-gray-400
          focus:outline-none
          font-medium
          tracking-wide
        "
      />

      {/* Botón de búsqueda */}
      <button
        onClick={onSubmit}
        aria-label="Buscar"
        className="
          flex items-center justify-center
          w-12
          bg-gradient-to-br from-[#F2F2F2] to-[#E6E6E6]
          hover:from-[#E0E0E0] hover:to-[#D9D9D9]
          border-l border-gray-300
          transition-all duration-300
          hover:shadow-inner
        "
      >
        <Search
          size={18}
          strokeWidth={2.2}
          className="
            text-gray-600
            group-hover:text-[#5F0F1B]
            transition-colors duration-300
          "
        />
      </button>
    </div>
  );
};

export default SearchBar;
