import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  accent?: "blue" | "green" | "teal";
};

const accents = {
  blue: "from-[#0C2A52] to-[#173F7A]",
  green: "from-[#136B2E] to-[#2D8C41]",
  teal:  "from-[#0C5A66] to-[#0E7E8D]",
};

export default function StatCard({ title, value, icon, accent="blue" }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-[0_6px_18px_rgba(0,0,0,.08)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-neutral-500">{title.toUpperCase()}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`rounded-lg p-3 text-white bg-gradient-to-br ${accents[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
