import { type ChangeEvent } from "react";
import type { CensoFilter } from "../CensusUser.service";
import { SearchInput } from "../../../components/SearchInput";
import StatusFilterSelect from "../../../components/StatusFilterSelect";

interface CensosToolbarProps {
  filter: CensoFilter;
  searchTerm: string;
  isSubmitting: boolean;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
  onBulkUpload: (file: File) => void;
}

export function CensosToolbar({
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: CensosToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-between bg-[var(--pantone-7421)] p-4">
        <h1 className="text-xl font-bold text-white md:text-2xl">Censos</h1>
      </div>

      <div className="mb-4 flex flex-col items-center justify-between gap-4 px-4 pt-4 md:flex-row">
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
