import { type ChangeEvent} from "react";
import { CirclePlus } from "lucide-react";

import type { OccupationFilter } from "../Occupations.service";
import { SearchInput } from "../../../components/SearchInput";
import AddButton from "../../../components/AddButton";
import StatusFilterSelect from "../../../components/StatusFilterSelect";

interface OccupationsToolbarProps {
  filter: OccupationFilter;
  searchTerm: string;
  isSubmitting: boolean;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
  onBulkUpload: (file: File) => void;
}

export function OccupationsToolbar({
  filter,
  searchTerm,
 
  onFilterChange,
  onSearchChange,
  onAddClick,
 
}: OccupationsToolbarProps) {


  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Ocupaciones</h1>

        <div className="flex items-center gap-2">
          <AddButton
            label="Agregar Ocupación"
            onClick={onAddClick}
            variant="gold"
            icon={<CirclePlus size={22} strokeWidth={2.5} />}
          />
        </div>
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
