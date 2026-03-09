import { type ChangeEvent } from "react";

import type { CensoFilter } from "../CUser.service";
import { SearchInput } from "../../../components/SearchInput";
import StatusFilterSelect from "../../../components/StatusFilterSelect";

interface CensosToolbarProps {
  filter: CensoFilter;
  searchTerm: string;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function CensosToolbar({
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: CensosToolbarProps) {
  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Censos</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 px-4 pt-4">
        <StatusFilterSelect value={filter} onChange={onFilterChange} />

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
    </>
  );
}