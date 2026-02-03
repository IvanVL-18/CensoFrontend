import { Download } from "lucide-react";
import type { ReportItem } from "./ReportsPage";

type Props = {
  item: ReportItem;
};

export default function ReportRow({ item }: Props) {
  const handleDownload = () => {
    console.log("Descargando reporte:", item.id);
  };

  return (
    <div className="grid grid-cols-[1fr_120px] items-center px-4 py-3 hover:bg-slate-50 transition">
      <div className="text-sm text-slate-800 truncate" title={item.name}>
        {item.name}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-white transition"
          title="Descargar"
          type="button"
        >
          <Download className="h-4 w-4 text-[#7A0C2E]" />
        </button>
      </div>
    </div>
  );
}
