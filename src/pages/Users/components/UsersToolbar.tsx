import { type ChangeEvent, useRef } from "react";
import { CirclePlus, FileDown } from "lucide-react";

import type { UserFilter } from "../Users.service";
import { SearchInput } from "../../../components/SearchInput";
import AddButton from "../../../components/AddButton";
import StatusFilterSelect from "../../../components/StatusFilterSelect";

interface UsersToolbarProps {
  filter: UserFilter;
  searchTerm: string;
  isSubmitting: boolean;
  onFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
  onBulkUpload: (file: File) => void;
}

export function UsersToolbar({
  filter,
  searchTerm,
  isSubmitting,
  onFilterChange,
  onSearchChange,
  onAddClick,
  onBulkUpload,
}: UsersToolbarProps) {
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
        <h1 className="text-xl md:text-2xl font-bold text-white">Usuarios</h1>

        <div className="flex items-center gap-2">
          {/* Input de archivo oculto que solo acepta Excel/CSV */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <AddButton
            label={isSubmitting ? "Cargando..." : "Carga Masiva"}
            onClick={() => fileInputRef.current?.click()}
            variant="green"
            disabled={isSubmitting} 
            icon={<FileDown size={22} strokeWidth={2.5} />}
          />

          <AddButton
            label="Agregar Usuario"
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
