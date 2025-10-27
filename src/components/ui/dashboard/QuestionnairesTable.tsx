import { memo, useMemo, useState, useEffect } from "react";
import { Eye, Search } from "lucide-react";
import { useDebouncedValue } from "../../../components/ui/dashboard/useDebouncedValue";

export type QRow = { id: number; name: string; questions: number };

type Props = {
  rows: QRow[];                   // ⬅️ datos ya paginados desde tu API
  page: number;
  perPage: number;
  total: number;
  query: string;
  loading?: boolean;

  onQueryChange: (q: string) => void;      // dispara fetch en el padre
  onPageChange: (p: number) => void;       // server-side
  onView?: (r: QRow) => void;
};

function QuestionnairesTableBase({
  rows,
  page,
  perPage,
  total,
  query,
  loading = false,
  onQueryChange,
  onPageChange,
  onView,
}: Props) {
  const [qLocal, setQLocal] = useState(query);
  const qDebounced = useDebouncedValue(qLocal, 300);

  useEffect(() => setQLocal(query), [query]);
  useEffect(() => {
    if (qDebounced !== query) onQueryChange(qDebounced);
  }, [qDebounced]); // eslint-disable-line

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1;
  const showingTo = Math.min(page * perPage, total);

  // Skeleton rows para estado loading
  const renderRows = useMemo(() => {
    if (loading) {
      return Array.from({ length: Math.min(perPage, 6) }).map((_, i) => (
        <tr key={`s-${i}`} className="border-b last:border-0 animate-pulse">
          <td className="py-2 pr-2"><div className="h-3 w-6 bg-neutral-200 rounded" /></td>
          <td className="py-2 pr-2"><div className="h-3 w-40 bg-neutral-200 rounded" /></td>
          <td className="py-2 pr-2"><div className="h-3 w-12 bg-neutral-200 rounded" /></td>
          <td className="py-2 pl-2">
            <div className="flex justify-end">
              <div className="h-6 w-6 bg-neutral-200 rounded" />
            </div>
          </td>
        </tr>
      ));
    }

    if (!rows?.length) {
      return (
        <tr>
          <td colSpan={4} className="py-6 text-center text-neutral-500">
            Sin resultados
          </td>
        </tr>
      );
    }

    return rows.map((r, idx) => (
      <tr key={r.id} className="border-b last:border-0">
        <td className="py-2 pr-2">{(page - 1) * perPage + idx + 1}</td>
        <td className="py-2 pr-2">{r.name}</td>
        <td className="py-2 pr-2">{r.questions}</td>
        <td className="py-2 pl-2">
          <div className="flex justify-end">
            <button
              className="rounded-md bg-[#C9A54C] text-white p-1.5 hover:brightness-95"
              title="Ver"
              onClick={() => onView?.(r)}
            >
              <Eye size={16} />
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [rows, loading, page, perPage, onView]);

  return (
    <div className="space-y-3">
      {/* buscador */}
      <div className="flex items-center justify-end gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            value={qLocal}
            onChange={(e) => { setQLocal(e.target.value); onPageChange(1); }}
            placeholder="Buscar…"
            className="pl-8 pr-3 py-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-[#7A1828]/40"
          />
        </div>
      </div>

      {/* tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b">
              <th className="py-2 pr-2 w-12">#</th>
              <th className="py-2 pr-2">Nombre</th>
              <th className="py-2 pr-2">Número de preguntas</th>
              <th className="py-2 pr-2 w-24 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>{renderRows}</tbody>
        </table>
      </div>

      {/* paginación */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-neutral-500">
          Mostrando {showingFrom}-{showingTo} de {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(1)}
            className="px-2 py-1 rounded border disabled:opacity-40"
          >
            «
          </button>
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-2 py-1 rounded border disabled:opacity-40"
          >
            ‹
          </button>
          <span className="px-2 text-sm">{page}/{totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-2 py-1 rounded border disabled:opacity-40"
          >
            ›
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="px-2 py-1 rounded border disabled:opacity-40"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(QuestionnairesTableBase);
