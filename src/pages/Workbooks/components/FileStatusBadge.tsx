import clsx from "clsx";
import {
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  Clock,
  Copy,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import type { WorkbookFileStatus } from "../Workbooks.types";
import { STATUS_HELP, STATUS_LABEL } from "../workbookLabels";

// El estado siempre lleva icono y texto: el color nunca va solo.
const STYLE: Record<WorkbookFileStatus, { icon: LucideIcon; className: string; spin?: boolean }> = {
  queued: { icon: Clock, className: "bg-gray-100 text-gray-700" },
  processing: { icon: LoaderCircle, className: "bg-blue-50 text-blue-800", spin: true },
  identified: { icon: CircleCheck, className: "bg-green-50 text-green-800" },
  duplicate: { icon: Copy, className: "bg-amber-50 text-amber-900" },
  unrecognized: { icon: CircleQuestionMark, className: "bg-orange-50 text-orange-900" },
  failed: { icon: CircleAlert, className: "bg-red-50 text-red-800" },
};

export function FileStatusBadge({ status }: { status: WorkbookFileStatus }) {
  const { icon: Icon, className, spin } = STYLE[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      title={STATUS_HELP[status]}
    >
      <Icon size={14} strokeWidth={2.25} className={clsx("shrink-0", spin && "animate-spin")} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
