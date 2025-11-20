// src/components/users/UsersFiltersBar.tsx
import { FilterSelect } from "../../users/components/FilterSelect";

interface Option {
  value: string;
  label: string;
}

interface UsersFiltersBarProps {
  roleOptions: Option[];
  statusOptions: Option[];
  institutionOptions: Option[];
  occupationOptions: Option[];

  roleValue: string;
  statusValue: string;
  institutionValue: string;
  occupationValue: string;

  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onInstitutionChange: (value: string) => void;
  onOccupationChange: (value: string) => void;
}

export function UsersFiltersBar({
  roleOptions,
  statusOptions,
  institutionOptions,
  occupationOptions,
  roleValue,
  statusValue,
  institutionValue,
  occupationValue,
  onRoleChange,
  onStatusChange,
  onInstitutionChange,
  onOccupationChange,
}: UsersFiltersBarProps) {
  return (
    <div className="w-full bg-[#F7F4EC] px-4 md:px-8 py-3 flex flex-wrap gap-3 items-center rounded-b-md">
      <FilterSelect
        value={roleValue}
        placeholder="Rol"
        options={roleOptions}
        onChange={onRoleChange}
      />

      <FilterSelect
        value={statusValue}
        placeholder="Estatus"
        options={statusOptions}
        onChange={onStatusChange}
      />

      <FilterSelect
        value={institutionValue}
        placeholder="Institución"
        options={institutionOptions}
        onChange={onInstitutionChange}
      />

      <FilterSelect
        value={occupationValue}
        placeholder="Ocupación"
        options={occupationOptions}
        onChange={onOccupationChange}
      />
    </div>
  );
}
