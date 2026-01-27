// src/pages/area/AreasToolbar.tsx
import { type ChangeEvent } from "react";
import { CirclePlus } from "lucide-react";
import { SearchInput } from "../../components/SearchInput";
import AddButton from "../../components/AddButton";
import StatusFilterSelect from "../../components/StatusFilterSelect";
import type { AreasToolbarProps } from "./Areas.interfaces";

export function AreasToolbar({
  filter,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onAddClick,
}: AreasToolbarProps) {
  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Áreas</h1>

        <AddButton
          label="Agregar Área"
          onClick={onAddClick}
          icon={<CirclePlus size={22} strokeWidth={2.5} />}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 px-4 pt-4">
        <StatusFilterSelect value={filter as any} onChange={onFilterChange} />

        <div className="w-full md:w-80">
          <SearchInput
            value={searchTerm}
            placeholder="Buscar área..."
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
