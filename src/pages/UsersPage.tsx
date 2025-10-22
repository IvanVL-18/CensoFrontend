import { useMemo, useState } from "react";
import UserFilter from "../components/users/UserFilter";
import SearchBar from "../components/users/SearchBar";
import Pagination from "../components/users/Pagination";

import EncuestadosTable from "../components/users/EncuestadosTable";
import type { SortDir, SortKey } from "../components/users/EncuestadosTable";

import AdministracionTable from "../components/users/AdministracionTable";
import ManagersTable from "../components/users/ManagersTable";

import NewEncuestadoModal from "../components/users/NewEncuestadoModal";
import type { NewEncuestadoPayload } from "../components/users/NewEncuestadoModal";

/** MOCKS */
type User = { id: number; avatar: string; fullName: string; role: string; institution: string; };
const MOCK_ENCUESTADOS: User[] = [
  { id: 1, avatar: "/avatar1.png", fullName: "Alexis Maturano", role: "Encuestado", institution: "Oficina Mayor" },
  { id: 2, avatar: "/avatar2.png", fullName: "Alma Guadalupe Gutierrez Cruz", role: "Encuestado", institution: "Secretaría de Contraloría" },
  { id: 3, avatar: "/avatar3.png", fullName: "Ismael Reyes", role: "Encuestado", institution: "Secretaría de Contraloría" },
  { id: 4, avatar: "/avatar4.png", fullName: "Iván Villa", role: "Encuestado", institution: "Oficina Mayor" },
  { id: 5, avatar: "/avatar5.png", fullName: "Cristiano Leon Maturano", role: "Encuestado", institution: "Oficina Mayor" },
  { id: 6, avatar: "/avatar6.png", fullName: "Erick Bautista", role: "Encuestado", institution: "Secretaría de Contraloría" },
  { id: 7, avatar: "/avatar7.png", fullName: "Memo Guillermo", role: "Encuestado", institution: "Oficina Mayor" },
  { id: 8, avatar: "/avatar8.png", fullName: "Leonardo Bautista", role: "Encuestado", institution: "Secretaría de Contraloría" },
];

const MOCK_ADMINISTRACION: User[] = [
  { id: 201, avatar: "/avatar1.png", fullName: "Erick Bautista", role: "Administrador", institution: "Secretaría de Contraloría" },
  { id: 202, avatar: "/avatar2.png", fullName: "Memo Guillermo", role: "Administrador", institution: "Oficina Mayor" },
];

const MOCK_MANAGERS: User[] = [
  { id: 301, avatar: "/avatar1.png", fullName: "Luis Fernández", role: "Manager", institution: "Secretaría de Contraloría" },
  { id: 302, avatar: "/avatar2.png", fullName: "Sofía Pérez", role: "Manager", institution: "Oficina Mayor" },
];

export default function UsersPage() {
  const [selectedOption, setSelectedOption] =
    useState<"encuestados" | "administracion" | "managers">("encuestados");

  // Header (buscar + nuevo encuestado)
  const [query, setQuery] = useState("");
  const [openNew, setOpenNew] = useState(false);

  // sort + paginación SOLO para encuestados (los otros son de ejemplo)
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  // 🔹 título dinámico según filtro
  const sectionTitle =
    selectedOption === "encuestados"
      ? "Encuestados"
      : selectedOption === "administracion"
      ? "Administración"
      : "Managers";

  // 🔹 si quieres mostrar el botón de alta solo en encuestados
  const showNewButton = selectedOption === "encuestados";

  // Al cambiar de filtro: resetea búsqueda y paginación
  const handleChangeSection = (opt: string) => {
    setSelectedOption(opt as any);
    setQuery("");
    setPage(1);
  };

  // Filtrado + ordenamiento (encuestados)
  const encuestadosFilteredSorted = useMemo(() => {
    let arr = [...MOCK_ENCUESTADOS];

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.institution.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      const A = (a as any)[sortKey]?.toString().toLowerCase() ?? "";
      const B = (b as any)[sortKey]?.toString().toLowerCase() ?? "";
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [query, sortKey, sortDir]);

  const total = encuestadosFilteredSorted.length;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return encuestadosFilteredSorted.slice(start, start + perPage);
  }, [encuestadosFilteredSorted, page, perPage]);

  const handleChangeSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // acciones
  const handleView = (u: User) => {
    alert(`Ver usuario\n${u.fullName}\n${u.institution}`);
  };

  const handleDelete = (u: User) => {
    if (!confirm(`¿Eliminar a ${u.fullName}?`)) return;
    const idx = MOCK_ENCUESTADOS.findIndex((x) => x.id === u.id);
    if (idx >= 0) {
      MOCK_ENCUESTADOS.splice(idx, 1);
      setQuery((q) => q + " "); // fuerza refresco simple
    }
  };

  const handleCreate = (payload: NewEncuestadoPayload) => {
    const newUser: User = {
      id: Math.max(...MOCK_ENCUESTADOS.map((u) => u.id)) + 1,
      avatar: "/avatar1.png",
      fullName: payload.email.split("@")[0],
      role: "Encuestado",
      institution: "Por asignar",
    };
    MOCK_ENCUESTADOS.unshift(newUser);
    setOpenNew(false);
    setPage(1);
  };

  return (
    <div className="p-6">
      {/* Filtro superior global */}
      <UserFilter onSelect={handleChangeSection} />

      {/* Contenedor principal */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
        {/* 🔸 Header dinámico */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl bg-[#5b1d27] px-4 py-3">
          <h2 className="text-white font-semibold">{sectionTitle}</h2>
          <div className="flex items-center gap-3">
            {/* Solo muestro buscador en encuestados (puedes habilitar para otros si quieres) */}
            {selectedOption === "encuestados" && (
              <SearchBar
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setPage(1);
                }}
              />
            )}
            {showNewButton && (
              <button
                onClick={() => setOpenNew(true)}
                className="rounded-full bg-amber-200/90 text-neutral-800 text-sm px-3 py-2 hover:opacity-90"
              >
                Nuevo Encuestado
              </button>
            )}
          </div>
        </div>

        {/* TABLAS según opción */}
        <div className="p-4">
          {selectedOption === "encuestados" && (
            <>
              <EncuestadosTable
                users={paginated}
                onView={handleView}
                onDelete={handleDelete}
                sortKey={sortKey}
                sortDir={sortDir}
                onChangeSort={handleChangeSort}
              />
              <Pagination
                page={page}
                perPage={perPage}
                total={total}
                onChangePage={setPage}
                onChangePerPage={(pp) => {
                  setPerPage(pp);
                  setPage(1);
                }}
              />
            </>
          )}

          {selectedOption === "administracion" && (
            <AdministracionTable users={MOCK_ADMINISTRACION} />
          )}

          {selectedOption === "managers" && (
            <ManagersTable users={MOCK_MANAGERS} />
          )}
        </div>
      </div>

      {/* Modal alta encuestado */}
      <NewEncuestadoModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
