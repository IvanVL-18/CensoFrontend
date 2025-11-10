
import CensoCard, { type Censo } from "../components/CensoCard";
import Pagination from "../components/Pagination";
import NewCensoModal from "../components/NewCensoModal";
import NewCensoButton from "../components/NewCensoButton";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const MOCK: Censo[] = [
  // ...tus mocks
];

export default function CensosPage() {
  const [items, setItems] = useState<Censo[]>(MOCK);

  // 🔎 búsqueda
  const [q, setQ] = useState("");

  // 📄 paginación según tu componente
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6); // ← usa lo que quieras por default

  // ➕ modal crear
  const [openCreate, setOpenCreate] = useState(false);

  // Filtrado
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => c.name.toLowerCase().includes(s));
  }, [items, q]);

  // Totales p/ Pagination
  const total = filtered.length;

  // Slice de la página actual
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);

  // Handlers Pagination (coinciden con tu API)
  const onChangePage = (p: number) => setPage(p);
  const onChangePerPage = (pp: number) => {
    setPerPage(pp);
    setPage(1); // reset a la primera cuando cambia el tamaño de página
  };

  // Crear (ejemplo local)
  const handleCreate = (p: {
    name: string; year: number; description: string;
    startDate: string; endDate: string; active: boolean;
  }) => {
    const nextId = (items.length ? Math.max(...items.map(i => i.id)) : 0) + 1;
    const nuevo: Censo = {
      id: nextId,
      name: p.name,
      year: p.year,
      status: "Creado",
      startDate: p.startDate,
      endDate: p.endDate,
      active: p.active,
    };
    setItems(prev => [nuevo, ...prev]);
    setQ("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="rounded-xl bg-[#5F0F1B] text-white shadow-md">
        <div className="px-6 py-4 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Censos</h2>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                placeholder="Buscar"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="w-full h-10 rounded-md pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
            </div>

            <NewCensoButton onClick={() => setOpenCreate(true)} />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pageItems.map((c) => (
          <CensoCard key={c.id} censo={c} onView={(id) => console.log("Ver censo", id)} />
        ))}
      </div>

      {/* 📟 Pagination: usa tus props exactas */}
      <div className="flex justify-center">
        <Pagination
          page={page}
          perPage={perPage}
          total={total}
          onChangePage={onChangePage}
          onChangePerPage={onChangePerPage}
          perPageOptions={[6, 9, 12]} // opcional
        />
      </div>

      {/* Modal crear */}
      <NewCensoModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
