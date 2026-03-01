import React, { useMemo } from "react";
import { ACTION_LABEL } from "../PermissionRoles.types";
import type { PermissionAction, PermissionModule, PermissionMap } from "../PermissionRoles.types";
import GovSwitch from "./GovSwitch";

type Props = {
  module: PermissionModule;
  value: PermissionMap;
  onToggle: (action: PermissionAction, next: boolean) => void;
  onToggleAll: (next: boolean) => void;
};

const PermissionModuleCard: React.FC<Props> = ({ module, value, onToggle, onToggleAll }) => {
  const Icon = module.icon;
 
  const allOn = useMemo(() => {
    const actions = module.actions ?? (Object.keys(ACTION_LABEL) as PermissionAction[]);
    return actions.every((a) => value[a]);
  }, [module.actions, value]);

  const actions = module.actions ?? (Object.keys(ACTION_LABEL) as PermissionAction[]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#611232]/10">
            <Icon className="h-5 w-5 text-[#611232]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">{module.label}</h3>
        </div>

        <button
          type="button"
          onClick={() => onToggleAll(!allOn)}
          className="text-xs font-semibold text-[#611232] hover:underline"
        >
          {allOn ? "Quitar todo" : "Permitir todo"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <div key={action} className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-700">{ACTION_LABEL[action]}</span>

            <GovSwitch
              label={`${module.label} - ${ACTION_LABEL[action]}`}
              checked={value[action]}
              onCheckedChange={(next) => onToggle(action, next)}
              size="sm"
              showStateText={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionModuleCard;