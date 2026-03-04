import { PlusCircle } from "lucide-react";

type Props = {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export default function SectionButton({
  label = "",
  onClick,
  disabled = false,
  loading = false,
  size = "md",
  className = "",
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium shadow-sm transition " +
    "focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60";

  const dims = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";

  const style =
    "bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.99]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={[base, dims, style, className].join(" ")}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <PlusCircle className="h-5 w-5" />
      )}
      {label}
    </button>
  );
}