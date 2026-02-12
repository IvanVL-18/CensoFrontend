import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
};

export default function ConfigurationNavCard({
  title,
  description,
  icon,
  onClick,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        `
          w-full text-left
          border border-gray-200 rounded-xl
          p-4 sm:p-5
          hover:border-[var(--pantone-7421)]
          hover:shadow-sm
          transition
          bg-white
          focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/30
        `,
        className
      )}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2 rounded-lg bg-[var(--pantone-7421)]/10 shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
