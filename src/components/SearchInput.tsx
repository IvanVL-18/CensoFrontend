// src/components/common/SearchInput.tsx
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function SearchInput({
  value,
  placeholder = "Buscar...",
  onChange,
}: SearchInputProps) {
  return (
    <div
      className="
        flex items-center w-full
        bg-white
        rounded-xl   
        py-2 pl-4 pr-3
        shadow-sm
        hover:shadow-md
        transition-all duration-150
      "
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          flex-1
          bg-transparent
          text-sm text-gray-700
          placeholder:text-gray-400
          focus:outline-none
        "
      />

      <div className="h-5 w-px bg-gray-300 mx-2"></div>

      <Search
        className="h-5 w-5 text-[#828282] cursor-pointer"
      />
    </div>
  );
}
