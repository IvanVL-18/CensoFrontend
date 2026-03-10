import { type ChangeEvent } from "react";
import { SearchInput } from "../../../components/SearchInput";

interface CensosToolbarProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function CensosToolbar({ searchTerm, onSearchChange }: CensosToolbarProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-red-900 mb-8">
      <h1 className="text-xl md:text-2xl font-bold text-white">Censos</h1>
      <div className="w-full md:w-80">
        <SearchInput
          value={searchTerm}
          placeholder="Buscar..."
          onChange={(value) =>
            onSearchChange({
              target: { value },
            } as ChangeEvent<HTMLInputElement>)
          }
        />
      </div>
    </div>
  );
}