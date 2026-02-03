import { SearchInput } from "../../components/SearchInput";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function ReportsTopBar({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-900">
          Descarga de reportes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Selecciona un censo y descarga su reporte.
        </p>
      </div>

      <div className="w-full md:w-[360px]">
        <SearchInput value={value} onChange={onChange} placeholder="Buscar" />
      </div>
    </div>
  );
}
