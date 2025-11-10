import { useState, useMemo, useEffect } from "react";
import { Eye, Trash2, ArrowUpDown, X } from "lucide-react";
import HeaderModule from "../components/HeaderModule";
import Pagination from "../components/Pagination";

type User = {
  id: number;
  fullName: string;
  institution: string;
};

const AvatarPlaceholder = () => (
  <div className="h-7 w-7 rounded-sm bg-gray-200 border border-gray-300" />
);

/** Modal ligera reutilizable */
function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Detalle"}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Card */}
      <div className="relative z-[101] w-full max-w-lg rounded-xl bg-white shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#691B31]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="px-5 py-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const EncuestadosTable = ({ users }: { users: User[] }) => {
  // Estado local para poder eliminar sin API aún
  const [data, setData] = useState<User[]>(users);
  useEffect(() => setData(users), [users]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 8;

  // Modal "ver"
  const [selected, setSelected] = useState<User | null>(null);

  // Filtrar por búsqueda (nombre o institución)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.institution.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const pageUsers = filtered.slice(indexOfFirstUser, indexOfLastUser);

  // 🔹 SOLO UN DATO DE EJEMPLO EN LA TABLA (primer elemento de la página)
  const currentUsers = pageUsers.length > 0 ? [pageUsers[0]] : [];

  const totalPages = Math.ceil(Math.max(filtered.length, 1) / usersPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handlers
  const handleView = (u: User) => setSelected(u);
  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header vino con buscador y botón */}
      <HeaderModule
        title="Encuestados"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => setCurrentPage(1)}
        onAddClick={() => console.log("Nuevo Encuestado")}
      />

      {/* Tabla */}
      <div className="p-4 sm:p-6">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed text-sm">
            {/* Cabecera clara */}
            <thead className="bg-gray-100 text-gray-700">
              <tr className="h-10">
                <th className="w-12 px-3 text-left font-medium">#</th>
                <th className="w-16 px-3 text-left font-medium">Avatar</th>
                <th className="px-3 text-left font-medium">
                  <div className="inline-flex items-center gap-2">
                    Nombre Completo
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="w-40 px-3 text-left font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Índice (1,2,3...) */}
                    <td className="px-3 py-3 text-gray-600">
                      {indexOfFirstUser + idx + 1}
                    </td>

                    {/* Avatar */}
                    <td className="px-3 py-3">
                      <AvatarPlaceholder />
                    </td>

                    {/* Nombre */}
                    <td className="px-3 py-3">
                      <span className="text-gray-800">{user.fullName}</span>
                      <div className="text-xs text-gray-500">
                        {user.institution}
                      </div>
                    </td>

                    {/* Acciones (botones ghost/outline) */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {/* Ver: outline dorado; se rellena al hover */}
                        <button
                          className="
                            inline-flex items-center justify-center h-8 w-8 rounded-md
                            border text-[#B49060] border-[#B49060]
                            bg-transparent
                            hover:bg-[#B49060] hover:text-white
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B49060]
                            transition
                          "
                          aria-label="Ver"
                          onClick={() => handleView(user)}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Eliminar: outline vino; se rellena al hover */}
                        <button
                          className="
                            inline-flex items-center justify-center h-8 w-8 rounded-md
                            border text-[#691B31] border-[#691B31]
                            bg-transparent
                            hover:bg-[#691B31] hover:text-white
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#691B31]
                            transition
                          "
                          aria-label="Eliminar"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500 italic">
                    No hay encuestados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación centrada */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        </div>
      </div>

      {/* Modal de detalle */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle del encuestado"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <AvatarPlaceholder />
              <div>
                <div className="font-medium text-gray-900">{selected.fullName}</div>
                <div className="text-gray-500">{selected.institution}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-md border p-3">
                <div className="text-xs text-gray-500">ID</div>
                <div className="text-gray-800">{selected.id}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-gray-500">Estado</div>
                <div className="text-gray-800">Activo</div>
              </div>
            </div>
            <p className="text-gray-600">
              Aquí puedes mostrar más campos (teléfono, correo, fecha, etc.)
              cuando conectes la API.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EncuestadosTable;
