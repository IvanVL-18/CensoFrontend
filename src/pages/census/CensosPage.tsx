// src/pages/census/page/CensosPage.tsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CensusCard, { type Census } from "../census/CensusCard";
import NewCensusModal from "../census/NewCensusModal";
import { SearchInput } from "../../components/SearchInput";
import {
  getCensuses,
  type PaginationMeta,
} from "../census/censos.service";

export default function CensosPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [censuses, setCensuses] = useState<Census[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false); // Solo para "Nuevo censo"

  // ─── Cargar datos desde API ─────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCensuses(page, search);
        setCensuses(res.data);
        setMeta(res.meta);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar los censos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search]);

  // ─── Acciones ─────────────────────────────
  const handleViewCensus = (census: Census) => {
    console.log("Ver censo", census);
  };

  const handleUpload = () => {
    console.log("Subir plantilla de censo");
  };

  // 👉 Cuando en el modal dan click en "Crear" → redirigir
  const handleOpenCreateForm = () => {
    setIsModalOpen(false);
    navigate("/censos/crear");
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // ─── Render ─────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <header
        className="bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3 
        flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <h1 className="text-lg font-semibold">Censos</h1>

        <div className="ml-auto w-full max-w-xs">
          <SearchInput
            value={search}
            placeholder="Buscar censo..."
            onChange={handleSearchChange}
          />
        </div>

        {/* Botón Agregar */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            mt-1 md:mt-0 inline-flex items-center gap-2
            px-4 py-1.5 rounded-xl text-sm font-medium

            bg-[#DDC9A3] text-[#691B31] 
            border border-[#DDC9A3]

            hover:bg-[#E0CEAA] hover:border-[#E0CEAA]
            hover:shadow-md
            active:scale-[0.97]

            transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar censo</span>
        </button>
      </header>

      {/* Estados de carga / error */}
      {loading && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Cargando censos...
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-red-600 mt-4">{error}</p>
      )}

      {/* Grid de tarjetas */}
      {!loading && !error && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {censuses.map((census) => (
            <CensusCard
              key={census.id}
              census={census}
              onView={handleViewCensus}
            />
          ))}

          {censuses.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-10">
              Aún no hay censos registrados.
            </div>
          )}
        </section>
      )}

      {/* Paginación simple */}
      {meta && (
        <footer className="flex justify-center items-center gap-1 mt-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full border text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPage(1)}
            disabled={meta.current_page === 1}
          >
            «
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full border text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.current_page === 1}
          >
            ‹
          </button>

          <span className="px-3 py-1 rounded-full border bg-[var(--pantone-7421)] text-xs text-white">
            {meta.current_page}
          </span>

          <button
            className="w-8 h-8 flex items-center justify-center rounded-full border text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={meta.current_page === meta.last_page}
          >
            ›
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full border text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPage(meta.last_page)}
            disabled={meta.current_page === meta.last_page}
          >
            N
          </button>
        </footer>
      )}

      {/* Modal Subir / Crear */}
      <NewCensusModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        onCreate={handleOpenCreateForm}
      />
    </div>
  );
}
