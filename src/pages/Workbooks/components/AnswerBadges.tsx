import clsx from "clsx";
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CirclePlus,
  Equal,
  History,
  LoaderCircle,
  PencilLine,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { AnswerChange, AnswersStatus, QuestionAnswerStatus } from "../Answers.types";
import { ANSWERS_HELP, ANSWERS_LABEL, CHANGE_LABEL, QUESTION_STATUS_LABEL } from "../answerLabels";

// El estado siempre lleva icono y texto: el color nunca va solo.
const badge = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium";

type Style = { icon: LucideIcon; className: string; spin?: boolean };

const ANSWERS_STYLE: Record<AnswersStatus, Style> = {
  pending: { icon: LoaderCircle, className: "bg-blue-50 text-blue-800", spin: true },
  extracted: { icon: CircleDot, className: "bg-orange-50 text-orange-900" },
  same: { icon: Equal, className: "bg-gray-100 text-gray-700" },
  imported: { icon: CircleCheck, className: "bg-green-50 text-green-800" },
  superseded: { icon: History, className: "bg-gray-100 text-gray-700" },
  failed: { icon: CircleAlert, className: "bg-red-50 text-red-800" },
};

/** Estado de las respuestas de un archivo. */
export function AnswersStatusBadge({ status, version }: { status: AnswersStatus; version?: number | null }) {
  const { icon: Icon, className, spin } = ANSWERS_STYLE[status];

  return (
    <span className={clsx(badge, className)} title={ANSWERS_HELP[status]}>
      <Icon size={14} strokeWidth={2.25} className={clsx("shrink-0", spin && "animate-spin")} aria-hidden="true" />
      {ANSWERS_LABEL[status]}
      {version && (status === "imported" || status === "superseded") ? ` · versión ${version}` : ""}
    </span>
  );
}

const QUESTION_STYLE: Record<QuestionAnswerStatus, Style> = {
  ok: { icon: CircleCheck, className: "bg-green-50 text-green-800" },
  warning: { icon: TriangleAlert, className: "bg-amber-50 text-amber-900" },
  error: { icon: CircleAlert, className: "bg-red-50 text-red-800" },
  empty: { icon: CircleDashed, className: "bg-gray-100 text-gray-600" },
};

/** Cómo quedó la lectura de una pregunta. */
export function QuestionStatusBadge({ status }: { status: QuestionAnswerStatus }) {
  const { icon: Icon, className } = QUESTION_STYLE[status];

  return (
    <span className={clsx(badge, className)}>
      <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      {QUESTION_STATUS_LABEL[status]}
    </span>
  );
}

const CHANGE_STYLE: Record<AnswerChange, Style> = {
  new: { icon: CirclePlus, className: "bg-blue-50 text-blue-800" },
  changed: { icon: PencilLine, className: "bg-amber-50 text-amber-900" },
  same: { icon: Equal, className: "bg-gray-100 text-gray-600" },
  removed: { icon: CircleDashed, className: "bg-red-50 text-red-800" },
};

/** Qué cambia una pregunta frente a las respuestas vigentes. */
export function ChangeBadge({ change }: { change: AnswerChange }) {
  const { icon: Icon, className } = CHANGE_STYLE[change];

  return (
    <span className={clsx(badge, className)}>
      <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      {CHANGE_LABEL[change]}
    </span>
  );
}
