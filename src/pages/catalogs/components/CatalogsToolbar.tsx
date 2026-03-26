import { type ChangeEvent, useRef } from "react";
import { CirclePlus, FileDown } from "lucide-react";

import type { CatalogFilter } from "../Catalogs.service";
import { SearchInput } from "../../../components/SearchInput";
import AddButton from "../../../components/AddButton";
import StatusFilterSelect from "../../../components/StatusFilterSelect";

interface CatalogsToolbarProps {
  filter: CatalogFilter;
  searchTerm: string;
  isSubmitting: boolean;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
  onBulkUpload: (file: File) => void;
}

export function CatalogsToolbar({
  filter,
  searchTerm,
  isSubmitting,
  onFilterChange,
  onSearchChange,
  onAddClick,
  onBulkUpload,
}: CatalogsToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBulkUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-red-900">
        <h1 className="text-xl md:text-2xl font-bold text-white">Catalogos</h1>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting}
          />

          <AddButton
            label="Importar"
            onClick={() => fileInputRef.current?.click()}
            variant="green"
            disabled={isSubmitting}
            icon={<FileDown size={22} strokeWidth={2.5} />}
          />

          <AddButton
            label="Agregar catalogo"
            onClick={onAddClick}
            variant="gold"
            disabled={isSubmitting}
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
