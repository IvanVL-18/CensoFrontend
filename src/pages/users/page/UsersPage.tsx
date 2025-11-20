// src/pages/users/UsersPage.tsx
import { useState } from "react";

// Componentes de UI de la vista
import { RoleHeaderBar } from "../../users/components/RoleHeaderBar";
import { UsersFiltersBar } from "../../users/components/UsersFiltersBar";
import { UsersTable } from "../../users/components/UsersTable";
import type { UserRow } from "../../users/components/UsersTable";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [institution, setInstitution] = useState("");
  const [occupation, setOccupation] = useState("");

  // 👉 MOCK de datos (luego aquí conectas tu API)
  const users: UserRow[] = [
    { id: 1, fullName: "Alexis Maturano" },
    { id: 2, fullName: "Alma Guadalupe Gutiérrez Cruz" },
    { id: 3, fullName: "Ismael Reyes" },
    { id: 4, fullName: "Iván Villa" },
    { id: 5, fullName: "Cristiano Leon Maturano" },
    { id: 6, fullName: "Erick Bautista" },
  ];

  // 🔎 Aplico búsqueda por nombre
  const filteredBySearch = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase().trim())
  );

  // 🔁 Aquí luego podrías aplicar filtros por rol/estatus/etc.
  const filteredByFilters = filteredBySearch; // de momento igual

  // ↕️ Ordenamiento por nombre
  const sortedUsers = [...filteredByFilters].sort((a, b) =>
    sortDir === "asc"
      ? a.fullName.localeCompare(b.fullName)
      : b.fullName.localeCompare(a.fullName)
  );

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 mb-10">
      {/* HEADER ROJO: título + buscador + botón */}
      <RoleHeaderBar
        title="Nombre del rol"
        searchValue={search}
        onSearchChange={setSearch}
        onNewClick={() => {
          // aquí abres modal o navegas a "Nuevo Encuestado"
          console.log("Nuevo encuestado");
        }}
      />

      {/* BARRA DE FILTROS */}
      <UsersFiltersBar
        roleOptions={[{ value: "encuestado", label: "Encuestado" }]}
        statusOptions={[
          { value: "activo", label: "Activo" },
          { value: "inactivo", label: "Inactivo" },
        ]}
        institutionOptions={[
          { value: "inegi", label: "INEGI" },
          { value: "snieg", label: "SNIEG" },
        ]}
        occupationOptions={[
          { value: "analista", label: "Analista" },
          { value: "capturista", label: "Capturista" },
        ]}
        roleValue={role}
        statusValue={status}
        institutionValue={institution}
        occupationValue={occupation}
        onRoleChange={setRole}
        onStatusChange={setStatus}
        onInstitutionChange={setInstitution}
        onOccupationChange={setOccupation}
      />

      {/* TABLA DE USUARIOS */}
      <UsersTable
        users={sortedUsers}
        sortDirection={sortDir}
        onToggleSort={() =>
          setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
        }
        onView={(u: UserRow) => console.log("Ver", u)}
        onEdit={(u: UserRow) => console.log("Editar", u)}
        onDelete={(u: UserRow) => console.log("Eliminar", u)}
      />

      {/* PAGINACIÓN (ya la tienes hecha) */}
      {/* <div className="mt-4 flex justify-center">
        <Pagination ... />
      </div> */}
    </div>
  );
}
