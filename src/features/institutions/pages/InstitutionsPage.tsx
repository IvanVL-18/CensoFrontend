import { useMemo, useState } from "react";
import InstitutionsHeader from "../components/InstitutionsHeader";
import InstitutionsTable from "../components/InstitutionsTable";
import Pagination from "../../../components/ui/common/Pagination";
import type { Institution, SortKey, SortDir } from "../types";
import { useDebouncedValue } from "../../../features/institutions//useDebouncedValue";

export default function InstitutionsPage() {
  const [rows, setRows] = useState<Institution[]>([]);   // ← vendrán de tu API
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  // Si tu API ya filtra y pagina, envía debouncedQuery/page/perPage al backend y quita todo lo de abajo
  const [sortKey, setSortKey] = useState<SortKey>("nombre");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let arr = q
      ? rows.filter(r =>
          r.nombre.toLowerCase().includes(q) ||
          r.municipio.toLowerCase().includes(q) ||
          r.tipo.toLowerCase().includes(q))
      : rows.slice();

    arr.sort((a, b) => {
      const A = (a as any)[sortKey]?.toString().toLowerCase() ?? "";
      const B = (b as any)[sortKey]?.toString().toLowerCase() ?? "";
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, debouncedQuery, sortKey, sortDir]);

  const total = filtered.length;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const handleChangeSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="p-6">
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <InstitutionsHeader
          query={query}
          onQueryChange={(v) => { setQuery(v); setPage(1); }}
          onNewClick={() => {/* abrir modal */}}
        />

        <div className="p-4">
          <InstitutionsTable
            rows={paginated}
            sortKey={sortKey}
            sortDir={sortDir}
            onChangeSort={handleChangeSort}
            startIndex={(page - 1) * perPage}
            onToggleMostrar={(r) =>
              setRows(prev => prev.map(x => x.id === r.id ? { ...x, mostrar: !x.mostrar } : x))
            }
            onView={(r) => {/* ver */}}
            onEdit={(r) => {/* editar */}}
            onDelete={(r) => {
              if (confirm(`¿Eliminar "${r.nombre}"?`)) {
                setRows(prev => prev.filter(x => x.id !== r.id));
              }
            }}
          />

          <div className="mt-4">
            <Pagination
              page={page}
              perPage={perPage}
              total={total}
              onChangePage={setPage}
              onChangePerPage={(pp) => { setPerPage(pp); setPage(1); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
