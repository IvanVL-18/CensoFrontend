import type { User } from "../types";

type Props = {
  users: User[];
  onEdit?: (u: User) => void;
  onDelete?: (u: User) => void;
  startIndex?: number;
};

export default function AdministracionTable({
  users,
  onEdit,
  onDelete,
  startIndex = 0,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#f7f3e8] text-sm text-[#420c1a]">
            <tr className="border-b border-[#e9dfd5]">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4">Avatar</th>
              <th className="py-3 px-4">Nombre Completo</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Institución</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="text-sm text-neutral-800">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  No hay resultados
                </td>
              </tr>
            )}

            {users.map((u, i) => (
              <tr
                key={u.id}
                className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors"
              >
                <td className="py-3 px-4 text-neutral-500">{startIndex + i + 1}</td>
                <td className="py-3 px-4">
                  <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-[#b48a70]/40">
                    <img
                      src={u.avatar}
                      alt={u.fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 px-4">{u.fullName}</td>
                <td className="py-3 px-4">{u.role}</td>
                <td className="py-3 px-4">{u.institution}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* ✏️ Botón Editar */}
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      title="Editar"
                      onClick={() => onEdit?.(u)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                      >
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                      </svg>
                    </button>

                    {/* 🗑️ Botón Eliminar */}
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                      title="Eliminar"
                      onClick={() => onDelete?.(u)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                      >
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-1 6h2v9H8V9Zm6 0h2v9h-2V9ZM6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
