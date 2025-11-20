// src/components/users/RoleHeaderBar.tsx
import { Plus } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import { PillButton } from "../../users/components/PillButton";

interface RoleHeaderBarProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewClick: () => void;
}

export function RoleHeaderBar({
  title,
  searchValue,
  onSearchChange,
  onNewClick,
}: RoleHeaderBarProps) {
  return (
    <header className="w-full bg-[#691B31] px-4 md:px-8 py-3 flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-between rounded-t-2xl">
      {/* Título del rol */}
      <h1 className="text-white font-semibold text-lg md:text-xl truncate">
        {title}
      </h1>

      {/* Buscador + botón */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex-1 md:w-72">
          <SearchInput value={searchValue} onChange={onSearchChange} />
        </div>

        <PillButton onClick={onNewClick}>
          <Plus className="h-4 w-4" />
          <span>Nuevo Encuestado</span>
        </PillButton>
      </div>
    </header>
  );
}
