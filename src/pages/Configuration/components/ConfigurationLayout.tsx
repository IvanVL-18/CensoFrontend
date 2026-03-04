import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function ConfigurationLayout({ title, children }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            {title}
          </h1>
        </div>
      </div>

      {children}
    </div>
  );
}
