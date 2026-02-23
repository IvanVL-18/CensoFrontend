import React from "react";
import { CheckCircle2 } from "lucide-react";

type Props = {
  title?: string;
  onAllowAll: () => void;
};

const PermissionRolesToolbar: React.FC<Props> = ({
  title = "Asignar Permisos",
  onAllowAll,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>

      <button
        type="button"
        onClick={onAllowAll}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9D2449]"
      >
        <CheckCircle2 className="h-4 w-4" />
        Permitir Todo
      </button>
    </div>
  );
};

export default PermissionRolesToolbar;