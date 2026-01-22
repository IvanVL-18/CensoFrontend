import type { ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type StatusFilter = "all" | "active" | "inactive";

type Props = {
  value: StatusFilter;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
};

export default function StatusFilterSelect({
  value,
  onChange,
  className,
}: Props) {
  return (
    <div className={clsx("w-full md:w-40", className)}>
      <div
        className="
          relative
          bg-white
          rounded-xl
          shadow-sm
          hover:shadow-md
          transition-all duration-150
          border border-gray-200
          focus-within:ring-2 focus-within:ring-[#DDC9A3]/60
          focus-within:border-[#DDC9A3]
        "
      >
        <select
          value={value}
          onChange={onChange}
          className="
            w-full h-10
            appearance-none
            bg-transparent
            text-sm text-gray-700
            pl-4 pr-10
            rounded-xl
            focus:outline-none
            cursor-pointer
          "
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <div className="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-px bg-gray-300 pointer-events-none" />

        <ChevronDown
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            h-5 w-5 text-[#828282]
            pointer-events-none
          "
        />
      </div>
    </div>
  );
}
