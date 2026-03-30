import { type ChangeEvent } from "react";
import { CirclePlus } from "lucide-react";

import type { CensoFilter } from "../Censos.service";
import { SearchInput } from "../../../components/SearchInput";
import AddButton from "../../../components/AddButton";
import StatusFilterSelect from "../../../components/StatusFilterSelect";

interface CensosToolbarProps {
  filter: CensoFilter;
  searchTerm: string;
  isSubmitting: boolean;
  canCreate?: boolean;
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
  onAddClick,
  canCreate = true,
}: CensosToolbarProps) {
  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Censos</h1>

        <div className="flex items-center gap-2">
          {/* Input de archivo oculto que solo acepta Excel/CSV */}
          
          {canCreate && (
            <AddButton
              label="Agregar censo"
              onClick={onAddClick}
              variant="gold"
              icon={<CirclePlus size={22} strokeWidth={2.5} />}
            />
          )}
        </div>
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
