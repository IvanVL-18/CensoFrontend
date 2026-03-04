import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
  showIcon?: boolean;
  size?: "sm" | "md";

  className?: string;
};

export default function Status({
  active,
  activeText = "Activo",
  inactiveText = "Inactivo",
  showIcon = true,
  size = "md",
  className = "",
}: Props) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border font-medium";

  const sizes =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  const activeCls =
    "border-emerald-200 bg-emerald-50 text-emerald-700";
  const inactiveCls =
    "border-slate-200 bg-slate-50 text-slate-600";

  const Icon = active ? CheckCircle2 : XCircle;

  return (
    <span
      className={[
        base,
        sizes,
        active ? activeCls : inactiveCls,
        className,
      ].join(" ")}
    >
      {showIcon ? <Icon className="h-4 w-4" /> : null}
      {active ? activeText : inactiveText}
    </span>
  );
}