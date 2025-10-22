type User = {
  id: number;
  avatar: string;
  fullName: string;
  role: string;
  institution: string;
};

export type SortKey = "fullName" | "role" | "institution";
export type SortDir = "asc" | "desc";

type Props = {
  users: User[];
  onView?: (u: User) => void;
  onDelete?: (u: User) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onChangeSort: (key: SortKey) => void;
  startIndex?: number;
};

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th
      className="py-3 px-4 cursor-pointer select-none whitespace-nowrap"
      onClick={onClick}
      title="Ordenar"
    >
      <div className="inline-flex items-center gap-1">
        <span>{label}</span>
        <span className="text-[10px] opacity-80">
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </div>
    </th>
  );
}

export default function EncuestadosTable({
  users,
  onView,
  onDelete,
  sortKey,
  sortDir,
  onChangeSort,
  startIndex = 0,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-[#f7f3e8] text-sm text-[#420c1a]">
          <tr className="border-b border-[#e9dfd5]">
            <th className="py-3 px-4 w-12">#</th>
            <th className="py-3 px-4">Avatar</th>
            <SortableTh
              label="Nombre Completo"
              active={sortKey === "fullName"}
              dir={sortDir}
              onClick={() => onChangeSort("fullName")}
            />
            <SortableTh
              label="Rol"
              active={sortKey === "role"}
              dir={sortDir}
              onClick={() => onChangeSort("role")}
            />
            <SortableTh
              label="Institución"
              active={sortKey === "institution"}
              dir={sortDir}
              onClick={() => onChangeSort("institution")}
            />
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
                <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-[#b48a70]/40 bg-neutral-100">
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
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                    title="Ver"
                    onClick={() => onView?.(u)}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9Z" />
                    </svg>
                  </button>

                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                    title="Eliminar"
                    onClick={() => onDelete?.(u)}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
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
  );
}
