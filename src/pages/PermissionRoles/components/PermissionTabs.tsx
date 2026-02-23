import React from "react";
import type { PermissionScope, PermissionTab } from "../PermissionRoles.types";

type Props = {
  tabs: PermissionTab[];
  active: PermissionScope;
  onChange: (key: PermissionScope) => void;
};

const PermissionTabs: React.FC<Props> = ({ tabs, active, onChange }) => {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition
                ${
                  isActive
                    ? "border-[#611232] bg-[#611232]/5 text-[#611232]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-b border-slate-200" />
    </div>
  );
};

export default PermissionTabs;