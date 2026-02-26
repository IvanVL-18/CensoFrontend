import React from "react";
import GovSwitch from "./GovSwitch";

type Props = {
  title?: string;
  allOn: boolean;
  onToggleAll: (next: boolean) => void;
};

const PermissionRolesToolbar: React.FC<Props> = ({
  title = "Asignar Permisos",
  allOn,
  onToggleAll,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-[#611232]">Permitir todo</span>
        <GovSwitch
          label="Permitir todo (global)"
          checked={allOn}
          onCheckedChange={onToggleAll}
          size="sm"
          showStateText={false}
        />
      </div>
    </div>
  );
};

export default PermissionRolesToolbar;