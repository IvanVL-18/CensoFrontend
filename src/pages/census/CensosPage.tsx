// src/pages/census/CensosPage.tsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CensusCard from "./CensusCard";
import NewCensusModal from "./NewCensusModal";
import { SearchInput } from "../../components/SearchInput";
import {
  getCensuses,
  type PaginationMeta,
  type Census,
} from "./censos.service";
import { Pagination } from "../../components/Pagination";
import CensusDetail from "./CensusDetail";

export default function CensosPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [censuses, setCensuses] = useState<Census[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 👇 Nuevo: censo seleccionado
  const [selectedCensus, setSelectedCensus] = useState<Census | null>(null);

  // ─── Cargar datos desde API ─────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCensuses(page, "active");
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
  }, [page]);

  // --- Búsqueda local (frontend) ---
  const filteredCensuses = censuses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Acciones ─────────────────────────────
  const handleViewCensus = (census: Census) => {
    setSelectedCensus(census);
  };

  const handleUpload = () => {
    console.log("Subir plantilla de censo");
  };

  const handleOpenCreateForm = () => {
    setIsModalOpen(false);
    navigate("/censos/crear");
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // ─── Render ─────────────────────────────
  return (
    <div className="space-y-4">
      {/* 👉 SOLO se muestra el header cuando NO hay censo seleccionado */}
      {!selectedCensus && (
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
      )}

      {/* Vista detalle vs lista */}
      {selectedCensus ? (
        <CensusDetail
          census={selectedCensus}
          onBack={() => setSelectedCensus(null)}
        />
      ) : (
        <>
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
              {filteredCensuses.map((census) => (
                <CensusCard
                  key={census.id}
                  census={census}
                  onView={handleViewCensus}
                />
              ))}

              {filteredCensuses.length === 0 && (
                <div className="col-span-full text-center text-sm text-gray-500 py-10">
                  No se encontraron censos con ese criterio.
                </div>
              )}
            </section>
          )}

          {/* Paginación */}
          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.last_page}
                onPageChange={setPage}
                siblingCount={1}
              />
            </div>
          )}
        </>
      )}

      {/* Modal Subir / Crear (sigue estando disponible) */}
      <NewCensusModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        onCreate={handleOpenCreateForm}
      />
    </div>
  );
}
