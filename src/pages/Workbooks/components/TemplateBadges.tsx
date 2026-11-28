import clsx from "clsx";
import {
  CircleCheck,
  CircleDot,
  CirclePlus,
  Equal,
  PencilLine,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { MatchStatus, ReviewStatus, TemplateFlag } from "../Templates.types";
import type { TemplateStatus } from "../Workbooks.types";
import { ANSWERED_SOURCE_NOTICE, FLAG_LABEL, MATCH_HELP, MATCH_LABEL, REVIEW_LABEL } from "../templateLabels";
import { TEMPLATE_LABEL } from "../workbookLabels";

// El estado siempre lleva icono y texto: el color nunca va solo.
const badge = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium";

const MATCH_STYLE: Record<MatchStatus, { icon: LucideIcon; className: string }> = {
  same: { icon: Equal, className: "bg-gray-100 text-gray-700" },
  retouched: { icon: PencilLine, className: "bg-amber-50 text-amber-900" },
  new: { icon: CirclePlus, className: "bg-blue-50 text-blue-800" },
};

export function MatchBadge({ status }: { status: MatchStatus | null }) {
  if (!status) return <span className="text-xs text-gray-500">Sin conciliar</span>;
  const { icon: Icon, className } = MATCH_STYLE[status];

  return (
    <span className={clsx(badge, className)} title={MATCH_HELP[status]}>
      <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      {MATCH_LABEL[status]}
    </span>
  );
}

const REVIEW_STYLE: Record<ReviewStatus, { icon: LucideIcon; className: string }> = {
  pending: { icon: CircleDot, className: "bg-orange-50 text-orange-900" },
  approved: { icon: CircleCheck, className: "bg-green-50 text-green-800" },
  not_needed: { icon: CircleCheck, className: "bg-gray-100 text-gray-600" },
};

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const { icon: Icon, className } = REVIEW_STYLE[status];

  return (
    <span className={clsx(badge, className)}>
      <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      {REVIEW_LABEL[status]}
    </span>
  );
}

const TEMPLATE_STYLE: Record<TemplateStatus, { icon: LucideIcon; className: string }> = {
  pending: { icon: CircleDot, className: "bg-gray-100 text-gray-700" },
  compiled: { icon: CircleCheck, className: "bg-gray-100 text-gray-700" },
  in_review: { icon: CircleDot, className: "bg-orange-50 text-orange-900" },
  approved: { icon: CircleCheck, className: "bg-green-50 text-green-800" },
};

export function TemplateStatusBadge({ status, toReview }: { status: TemplateStatus; toReview?: number | null }) {
  const { icon: Icon, className } = TEMPLATE_STYLE[status];

  return (
    <span className={clsx(badge, className)}>
      <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      {TEMPLATE_LABEL[status]}
      {status === "in_review" && toReview ? ` · ${toReview} por revisar` : ""}
    </span>
  );
}

/** Aviso de que la plantilla del cuaderno se armó con un contestado y no con el cuaderno en blanco. */
export function AnsweredSourceNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="note">
      <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      {ANSWERED_SOURCE_NOTICE}
    </p>
  );
}

/** Dudas del compilador sobre una pregunta. */
export function FlagList({ flags }: { flags: TemplateFlag[] }) {
  if (flags.length === 0) return null;

  return (
    <ul className="space-y-1">
      {flags.map((flag) => (
        <li key={flag} className="flex items-start gap-1.5 text-xs text-amber-900">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {FLAG_LABEL[flag] ?? flag}
        </li>
      ))}
    </ul>
  );
}
