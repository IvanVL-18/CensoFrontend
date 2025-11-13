import { useMemo, useState } from "react";
import CensoCard, { type Censo } from "../components/CensoCard";
import Pagination from "../components/Pagination";
import NewCensoModal from "../components/NewCensoModal";
import NewCensoButton from "../components/NewCensoButton";
import SearchBar from "../components/SearchBar"; // Importamos el SearchBar

const MOCK: Censo[] = [
  // Tus mocks aquí
];

export default function CensosPage() {
  const [items, setItems] = useState<Censo[]>(MOCK);
  const [q, setQ] = useState(""); // Estado para la búsqueda

  // Filtrado de los items basado en la búsqueda
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => c.name.toLowerCase().includes(s));
  }, [items, q]);

  // Paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);

  const total = filtered.length;

  const onChangePage = (p: number) => setPage(p);
  const onChangePerPage = (pp: number) => {
    setPerPage(pp);
    setPage(1); // Reset a la primera página cuando cambie el tamaño de página
  };

  const handleSearchChange = (query: string) => {
    setQ(query);
    setPage(1); // Reiniciar la página al cambiar la búsqueda
  };

  const [openCreate, setOpenCreate] = useState(false);

  const handleCreate = (p: {
    name: string;
    year: number;
    description: string;
    startDate: string;
    endDate: string;
    active: boolean;
  }) => {
    const nextId = (items.length ? Math.max(...items.map((i) => i.id)) : 0) + 1;
    const nuevo: Censo = {
      id: nextId,
      name: p.name,
      year: p.year,
      status: "Creado",
      startDate: p.startDate,
      endDate: p.endDate,
      active: p.active,
    };
    setItems((prev) => [nuevo, ...prev]);
    setQ(""); // Limpiar la búsqueda
    setPage(1); // Reset a la primera página
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="rounded-xl bg-[#5F0F1B] text-white shadow-md">
        <div className="px-6 py-4 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Censos</h2>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <SearchBar
              searchQuery={q}
              onSearchChange={handleSearchChange} // Función que maneja el cambio
            />
            <NewCensoButton onClick={() => setOpenCreate(true)} />
          </div>
        </div>
      </div>

      {/* Grid de Censos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pageItems.map((c) => (
          <CensoCard key={c.id} censo={c} onView={(id) => console.log("Ver censo", id)} />
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / perPage)}
          onPageChange={onChangePage}
        />
      </div>

      {/* Modal para crear un nuevo Censo */}
      <NewCensoModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
