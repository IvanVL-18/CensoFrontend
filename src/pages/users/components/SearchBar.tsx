import { Search } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md w-1/4">
      <Search size={20} className="text-[#5F0F1B]" />
      <input
        type="text"
        placeholder="Buscar..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border-none outline-none text-[#5F0F1B] w-full"
      />
    </div>
  );
};

export default SearchBar;
