import type { User } from "../types";

type Props = {
  users: User[];
  onView?: (u: User) => void;
  onAssign?: (u: User) => void;
  startIndex?: number;
};

export default function ManagersTable({
  users,
  onView,
  onAssign,
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
                    {/* 👁️ Botón Ver */}
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      title="Ver"
                      onClick={() => onView?.(u)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                      >
                        <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9Z" />
                      </svg>
                    </button>

                    {/* 👔 Botón Asignar */}
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                      title="Asignar tareas o permisos"
                      onClick={() => onAssign?.(u)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.31 0-6 2.69-6 6h2a4 4 0 0 1 8 0h2c0-3.31-2.69-6-6-6Z" />
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
