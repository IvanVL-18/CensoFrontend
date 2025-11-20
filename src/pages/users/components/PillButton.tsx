// src/components/common/PillButton.tsx
import { type ReactNode } from "react";

interface PillButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export function PillButton({ children, onClick }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#DDC9A3] hover:bg-[#E6D8B5] text-[#691B31] font-medium text-xs md:text-sm px-4 py-2 transition-colors"
    >
      {children}
    </button>
  );
}
