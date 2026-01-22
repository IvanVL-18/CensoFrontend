import { useMemo, useState } from "react";
import ReportsTopBar from "./components/ReportsTopBar";
import ReportsTable from "./components/ReportsTable";

export type ReportItem = {
  id: string;
  name: string;
  downloadUrl?: string;
};

export default function ReportsPage() {
  const [query, setQuery] = useState("");

  const reports: ReportItem[] = [
    { id: "1", name: "Censo nacional 2024" },
    { id: "2", name: "Censo nacional 2025" },
    { id: "3", name: "Censo nacional 2022" },
  ];

  const filteredReports = useMemo(() => {
    const q = query.toLowerCase();
    return reports.filter((r) =>
      r.name.toLowerCase().includes(q)
    );
  }, [query, reports]);

  return (
    <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
      <div className="h-12 bg-[#7A0C2E]" />

      <div className="p-6">
        <ReportsTopBar value={query} onChange={setQuery} />

        <div className="mt-5">
          <ReportsTable items={filteredReports} />
        </div>
      </div>
    </div>
  );
}
