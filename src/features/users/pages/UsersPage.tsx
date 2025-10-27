import { useEffect, useMemo, useState } from "react";

import UsersHeader from "../components/UsersHeader";                // ✅ usar header reutilizable
import UserFilter from "../components/UserFilter";
import EncuestadosTable from "../components/EncuestadosTable";
import type { SortDir, SortKey } from "../components/EncuestadosTable";
import AdministracionTable from "../components/AdministracionTable";
import ManagersTable from "../components/ManagersTable";

import Pagination from "../../../components/ui/common/Pagination";

import NewEncuestadoModal from "../modals/NewEncuestadoModal";
import type { NewEncuestadoPayload } from "../modals/NewEncuestadoModal";

import type { User } from "../types";   // ⬅️ usa el tipo central

export default function UsersPage() {
  const [selectedOption, setSelectedOption] =
    useState<"encuestados" | "administracion" | "managers">("encuestados");

  // Datos (vacíos hasta conectar API)
  const [encuestados, setEncuestados] = useState<User[]>([]);
  const [administracion, setAdministracion] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  // Filtros y modal
  const [query, setQuery] = useState<string>("");
  const [openNew, setOpenNew] = useState<boolean>(false);

  // Ordenamiento y paginación
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(8);

  const sectionTitle =
    selectedOption === "encuestados"
      ? "Encuestados"
      : selectedOption === "administracion"
      ? "Administración"
      : "Managers";

  const showNewButton = selectedOption === "encuestados";
  const showSearch = selectedOption === "encuestados";

  const handleChangeSection = (opt: string) => {
    setSelectedOption(opt as any);
    setQuery("");
    setPage(1);
  };

  // Carga de datos (luego conecta a tu API)
  useEffect(() => {
    // TODO: if (selectedOption === "encuestados") fetch...
  }, [selectedOption]);

  // Filtrado + ordenamiento (client-side) — solo para "encuestados"
  const encuestadosFilteredSorted = useMemo(() => {
    let arr = [...encuestados];

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
  }, [encuestados, query, sortKey, sortDir]);

  const total = encuestadosFilteredSorted.length;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return encuestadosFilteredSorted.slice(start, start + perPage);
  }, [encuestadosFilteredSorted, page, perPage]);

  const handleChangeSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d: SortDir) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Acciones
  const handleView = (u: User) => {
    alert(`Ver usuario\n${u.fullName}\n${u.institution}`);
  };

  const handleDelete = (u: User) => {
    if (!confirm(`¿Eliminar a ${u.fullName}?`)) return;
    // TODO: await api.deleteEncuestado(u.id)
    setEncuestados((prev) => prev.filter((x) => x.id !== u.id));
  };

  const handleCreate = (payload: NewEncuestadoPayload) => {
    // TODO: const created = await api.createEncuestado(payload)
    // setEncuestados(prev => [created, ...prev])
    setOpenNew(false);
    setPage(1);
  };

  return (
    <div className="p-6">
      <UserFilter onSelect={handleChangeSection} />

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
        {/* ✅ Header reutilizable */}
        <UsersHeader
          title={sectionTitle}
          showSearch={showSearch}
          query={query}
          onQueryChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          showNewButton={showNewButton}
          onNewClick={() => setOpenNew(true)}
        />

        {/* Contenido por sección */}
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
                startIndex={(page - 1) * perPage}
              />
              <Pagination
                page={page}
                perPage={perPage}
                total={total}
                onChangePage={(p: number) => setPage(p)}
                onChangePerPage={(pp: number) => {
                  setPerPage(pp);
                  setPage(1);
                }}
              />
            </>
          )}

          {selectedOption === "administracion" && (
            <AdministracionTable users={administracion} />
          )}

          {selectedOption === "managers" && (
            <ManagersTable users={managers} />
          )}
        </div>
      </div>

      <NewEncuestadoModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
