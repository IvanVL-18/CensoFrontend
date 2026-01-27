import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function SettingsGrid({ children, className = "" }: Props) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 ${className}`}
    >
      {children}
    </div>
  );
}
