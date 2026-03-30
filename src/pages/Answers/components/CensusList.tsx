import { Loader2 } from "lucide-react";
import type { MyCensus } from "../Answers.types";
import { CensusCard } from "./CensusCard";

interface CensusListProps {
  censuses: MyCensus[];
  loading: boolean;
  error: string | null;
  onSelect: (census: MyCensus) => void;
}

export function CensusList({
  censuses,
  loading,
  error,
  onSelect,
}: CensusListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400 gap-2">
        <Loader2 size={24} className="animate-spin" />
        <span>Cargando censos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  if (!censuses.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">No tienes censos activos asignados a tu institución.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {censuses.map((census) => (
        <CensusCard key={census.id} census={census} onSelect={onSelect} />
      ))}
    </div>
  );
}
