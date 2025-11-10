import { ChevronDown } from "lucide-react";

type SearchCProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

const SearchC = ({ searchQuery, onSearchChange }: SearchCProps) => {
  return (
    <div className="relative flex items-center bg-white p-1 rounded-lg w-1/3">
      <input
        type="text"
        placeholder="Buscar..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border-none outline-none text-black w-full"
      />
      <div className="absolute inset-y-0 right-0 flex items-center px-3 bg-[#D4C09B]  rounded-r-lg pointer-events-none">
        <ChevronDown size={20} />
      </div>
    </div>
  );
};

export default SearchC;
