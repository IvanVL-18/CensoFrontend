// src/pages/census/CensosPage.tsx
import { useEffect, useState } from "react";
import { CirclePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CensusCard from "./components/CensusCard";
import NewCensusModal from "./components/NewCensusModal";
import CensusDetail from "./components/CensusDetail";

import { SearchInput } from "../../components/SearchInput";
import AddButton from "../../components/AddButton";
import Pagination from "../../components/Pagination";

import { getCensuses } from "./censos.service";
import type { Census, PaginationMeta } from "./census.types";

type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export default function CensosPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [censuses, setCensuses] = useState<Census[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [links, setLinks] = useState<PaginationLinks | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCensus, setSelectedCensus] = useState<Census | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCensuses(page, "active");

        setCensuses(res.data);
        setMeta(res.meta);

        setLinks(res.links ?? null);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error al cargar los censos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const filteredCensuses = censuses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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

  const handlePageClick = (url: string | null) => {
    if (!url) return;

    try {
      const u = new URL(url);
      const p = u.searchParams.get("page");
      if (!p) return;
      const pageNum = Number(p);
      if (Number.isFinite(pageNum)) setPage(pageNum);
    } catch {
      const match = url.match(/[?&]page=(\d+)/);
      if (!match) return;
      setPage(Number(match[1]));
    }
  };

  return (
    <div className="space-y-4">
      {!selectedCensus && (
        <header
          className="
            bg-[var(--pantone-7421)] text-white rounded-xl px-4 py-3
            flex flex-col gap-3 md:flex-row md:items-center md:justify-between
          "
        >
          <h1 className="text-lg font-semibold">Censos</h1>

          {/* Buscador + Botón */}
          <div className="w-full md:w-auto md:ml-auto flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="w-full md:w-80">
              <SearchInput
                value={search}
                placeholder="Buscar censo..."
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex justify-end sm:justify-start">
              <AddButton
                label="Agregar censo"
                onClick={() => setIsModalOpen(true)}
                icon={<CirclePlus size={22} strokeWidth={2.5} />}
              />
            </div>
          </div>
        </header>
      )}

      {selectedCensus ? (
        <CensusDetail
          census={selectedCensus}
          onBack={() => setSelectedCensus(null)}
        />
      ) : (
        <>
          {loading && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Cargando censos...
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-red-600 mt-4">{error}</p>
          )}

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

          <div className="mt-4 flex justify-center">
            <Pagination
              meta={meta as any}
              links={links as any}
              loading={loading}
              error={error}
              onPageClick={handlePageClick}
            />
          </div>
        </>
      )}

      <NewCensusModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        onCreate={handleOpenCreateForm}
      />
    </div>
  );
}
